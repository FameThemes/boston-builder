<?php

class Fame_Builder
{
    static $content_key = '_fame_builder_content';
    function __construct()
    {
        define('FAME_BUILDER_URL', self::get_url(__FILE__));
        define('FAME_BUILDER_PATH', trailingslashit(dirname(__FILE__)));
        add_action('edit_form_after_title', array( $this, 'builder_interface' ) );
        add_action('admin_enqueue_scripts', array( $this, 'builder_css' ) );
        add_action('admin_footer', array( $this, 'wp_editor_tpl' ) );

        add_action('save_post', array( $this, 'save_builder_data' ), 55, 3 );
        //do_action( 'save_post', $post_ID, $post, $update );
    }

    function save_builder_data( $post_id , $post = null , $update = false ){
        $data =   isset( $_REQUEST['fame_builder_content'] ) ? $_REQUEST['fame_builder_content'] : '{}';
        if ( is_string( $data ) ) {
            $data = json_decode( stripslashes_deep( $data ) , true );
        }

        update_post_meta( $post_id, self::$content_key, $data );
    }

    static function get_builder_content( $post_id = 0 ){
        if ( ! $post_id ) {
            global $post;
            $post_id = $post->ID;
        }
        return get_post_meta( $post_id, self::$content_key, true );
    }
    static function is_active_builder(){
        global $hook_suffix;
        $show = $hook_suffix == 'post.php' || $hook_suffix == 'post-new.php';
        return  apply_filters( 'fame_builder_active_on', $show ) ;
    }

    /**
     * Get url of any dir
     *
     * @param string $file full path of current file in that dir
     * @return string
     */
    static function get_url($file = '')
    {
        if ( ! $file ) {
            return $file;
        }
        if ('WIN' === strtoupper(substr(PHP_OS, 0, 3))) {
            // Windows
            $content_dir = str_replace('/', DIRECTORY_SEPARATOR, WP_CONTENT_DIR);
            $content_url = str_replace($content_dir, WP_CONTENT_URL, trailingslashit(dirname($file)));
            $url = str_replace(DIRECTORY_SEPARATOR, '/', $content_url);
        } else {
            $url = str_replace(
                array(WP_CONTENT_DIR, WP_PLUGIN_DIR),
                array(WP_CONTENT_URL, WP_PLUGIN_URL),
                trailingslashit(dirname($file))
            );
        }
        return set_url_scheme($url);
    }

    function wp_editor_tpl( )
    {
        if ( self::is_active_builder() ) {
            ?>
            <script id="_wp-mce-editor-tpl" type="text/html">
                <?php
                wp_editor('', '__wp_mce_editor__',
                    array(
                        '_content_editor_dfw' => true,
                        'drag_drop_upload' => true,
                        //'tabfocus_elements' => 'content-html,save-post',
                        //'editor_height' => 300,
                        'tinymce' => array(
                            'resize' => false,
                            'wp_autoresize_on' => true,
                            'add_unload_trigger' => false,
                        )
                    )
                );
                ?>
            </script>
            <?php
        }
    }

    function builder_css( $hook = '' )
    {
        if ( self::is_active_builder() ) {
            wp_enqueue_style('fame-builder', FAME_BUILDER_URL . 'admin/assets/css/builder.css');
            wp_enqueue_style('wp-color-picker');
            wp_enqueue_style('jquery-ui');
        }
    }

    static function get_items_config()
    {
        $items = array();

        $items['text'] = array(
            'id' => 'text',
            'title' => esc_html__('Text', 'texdomain'),
            'icon'  => 'dashicons dashicons-editor-alignleft',
            'preview' => ' {{{ data.text }}}',
            'fields' => array(
                array(
                    'id' => 'text',
                    'type' => 'editor',
                    'title' => esc_html__('text', 'texdomain'),
                    'desc' => __('Desc Here', 'texdomain'),
                    'default' => __('Default value', 'texdomain'),
                )
            )
        );

        $items['image'] = array(
            'id' => 'image',
            'title' => esc_html__('Image', 'texdomain'),
            'icon'  => 'dashicons dashicons-format-image',
            'preview' => '
                  
                        <div class="fame-media-preview <# if ( data.image.url ) { #> has-preview <# } #>"
                        <# if ( data.image.type == \'\'  && data.image.url ) { #>
                            style="background-image: url(\'{{ data.image.url }}\');"
                        <# } #>
                        >
                            <# if ( data.image.type != \'\' && data.image.url ) { #>
                                <video width="400" muted controls>
                                    <source src="{{ data.image.url }}" type="{{ data.image.type }}">
                                    '.esc_html__( 'Your browser does not support HTML5 video.', 'textdomain' ).'
                                </video>
                            <# } #>
                        </div>',
            'fields' => array(
                array(
                    'id' => 'image',
                    'type' => 'media',
                    'title' => esc_html__('Image', 'texdomain'),
                    //'desc' => __('Desc Here', 'texdomain'),
                )
            )
        );

        $items['gallery'] = array(
            'id' => 'gallery',
            'title' => esc_html__('Gallery', 'texdomain'),
            'icon'  => '',
            'preview' => '',
            'fields' => array(
                array(
                    'id' => 'text',
                    'type' => 'textarea',
                    'title' => esc_html__('text', 'texdomain'),
                    'desc' => __('Desc Here', 'texdomain'),
                    'default' => __('Default value', 'texdomain'),
                )
            )
        );


        $items['tabs'] = array(
            'id' => 'tabs',
            'title' => esc_html__('Tabs', 'texdomain'),
            'icon'  => '',
            'preview' => '',
            'fields' => array(
                array(
                    'id' => 'text',
                    'type' => 'textarea',
                    'title' => esc_html__('text', 'texdomain'),
                    'desc' => __('Desc Here', 'texdomain'),
                    'default' => __('Default value', 'texdomain'),
                )
            )
        );

        // Ensure item is unique
        $new_array = array();
        foreach ( $items as $item ) {
            $item = wp_parse_args( $item, array(
                'id' => '',
                'title' => '',
                'icon' => '',
                'icon_type' => '', // can be url or icon
                'preview' => '',
                'fields' => array(),
            ) );

            $item['icon_type'] = ( filter_var( $item['icon'] , FILTER_VALIDATE_URL ) ) ? 'url' : 'icon' ;
            $new_array[ $item['id'] ] = $item;
        }

        return $new_array;
    }

    static function get_row_config()
    {
        $columns = array();
        for ( $i =  1; $i <= 4; $i ++  ){
            $columns[ $i ] = $i;
        }
        $config = array(
            'title' => esc_html__('Row', 'texdomain'),
            'preview' => '',
            'fields'=>  array(
                array(
                    'id' => 'id',
                    'type' => 'text',
                    'title' => esc_html__( 'ID', 'texdomain' ),
                    'desc' => __( 'Desc id Here', 'texdomain' ),
                    'default' => '',
                ),
                array(
                    'id' => 'columns',
                    'type' => 'select',
                    'title' => esc_html__( 'Columns', 'texdomain' ),
                    'default' => 1,
                    'options' => $columns
                ),
            )
        );
        return $config;
    }

    static function get_col_config()
    {
        $config = array(
            'title' => esc_html__('Column', 'texdomain'),
            'preview' => '',
            'fields'=>  array(
                array(
                    'id' => 'id',
                    'type' => 'text',
                    'title' => esc_html__( 'ID', 'texdomain' ),
                    'desc' => __( 'Desc id Here', 'texdomain' ),
                    'default' => '',
                ),
                array(
                    'id' => 'text',
                    'type' => 'textarea',
                    'title' => esc_html__( 'Column description', 'texdomain' ),
                    'desc' => __( 'Desc Here', 'texdomain' ),
                    'default' => __( 'description value', 'texdomain' ),
                )
            )
        );
        return $config;
    }

    function builder_interface( $post )
    {
        if ( ! self::is_active_builder() ) {
            return;
        }

        wp_enqueue_script( 'jquery' );
        wp_enqueue_script( 'jquery-ui-core' );
        wp_enqueue_script( 'jquery-ui-sortable' );
        wp_enqueue_script( 'jquery-ui-resizable' );
        wp_enqueue_script( 'jquery-ui-draggable' );
        wp_enqueue_script( 'wp-color-picker' );

        wp_enqueue_media();

        wp_enqueue_script( 'fame-editor', FAME_BUILDER_URL.'admin/assets/js/editor.js', array( 'jquery' ), false, true );
        wp_enqueue_script( 'fame-builder', FAME_BUILDER_URL.'admin/assets/js/builder.js', array( 'jquery' ), false, true );
        wp_localize_script( 'fame-builder', 'FAME_BUILDER', array(
            'default_row_col' => 2, // 50%
            'max_columns' => 12,
            'min_columns' => 2, //
            'row' => $this->get_row_config(),
            'col' => $this->get_col_config(),
            'items' => $this->get_items_config(),
            'open_setting_when_new' => true,
            'texts' => array(
                'confirm_remove' => __( 'Are you sure want to remove ?', 'textdomain' ),
                'new_item_modal' => __( 'Add new item', 'textdomain' ),
            ),
        ) );
        include dirname( __FILE__ ).'/admin/interface.php';
    }
}

new Fame_Builder();