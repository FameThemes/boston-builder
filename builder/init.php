<?php

class Fame_Builder
{
    static $content_key = '_fame_builder_content';
    static $content_type = '_fame_post_content';
    function __construct()
    {
        define('FAME_BUILDER_URL', self::get_url(__FILE__));
        define('FAME_BUILDER_PATH', trailingslashit(dirname(__FILE__)));


        if ( is_admin() ) {
            add_action('edit_form_after_title', array($this, 'builder_interface'));
            add_action('admin_enqueue_scripts', array($this, 'builder_css'));
            add_action('admin_footer', array($this, 'wp_editor_tpl'));
            add_editor_style(FAME_BUILDER_URL . 'assets/css/editor.css');
            add_action('save_post', array($this, 'save_builder_data'), 55, 3);
        } else {
            $this->frontend_includes();
        }

    }

    function frontend_includes(){
        require_once FAME_BUILDER_PATH.'inc/class-render-content.php';
    }


    function save_builder_data( $post_id , $post = null , $update = false ){

        // Check if nonce is valid.
       // if ( ! wp_verify_nonce( $nonce_name, $nonce_action ) ) {
         //   return;
        //}

        // Check if user has permissions to save data.
        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        // Check if not an autosave.
        if ( wp_is_post_autosave( $post_id ) ) {
            return;
        }

        // Check if not a revision.
        if ( wp_is_post_revision( $post_id ) ) {
            return;
        }

        //die( 'can save' );

        $data =   isset( $_REQUEST['fame_builder_content'] ) ? $_REQUEST['fame_builder_content'] : '{}';
        if ( is_string( $data ) ) {
            $data = json_decode( stripslashes_deep( $data ) , true );
        }
        $type =  isset( $_REQUEST['fame_post_content_type'] ) ? $_REQUEST['fame_post_content_type'] : 'content';

        update_post_meta( $post_id, self::$content_key, $data );
        update_post_meta( $post_id, self::$content_type, $type );
    }

    static function get_builder_content( $post_id = 0 ){
        if ( ! $post_id ) {
            global $post;
            $post_id = $post->ID;
        }
        return get_post_meta( $post_id, self::$content_key, true );
    }

    static function get_content_type( $post_id = 0 ){
        if ( ! $post_id ) {
            global $post;
            $post_id = $post->ID;
        }
        return get_post_meta( $post_id, self::$content_type, true );
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

        $image_sizes = array();
        foreach ( get_intermediate_image_sizes() as $size ) {
            $image_sizes[ $size ] = $size;
        }

        $items['text'] = array(
            'id' => 'text',
            'title' => esc_html__('Text', 'texdomain'),
            'desc' => esc_html__('Text blog', 'texdomain'),
            'icon'  => 'dashicons dashicons-editor-alignleft',
            'content_template' => ' {{{ data.text }}}',
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
            'desc' => esc_html__('Inser a image', 'texdomain'),
            'icon'  => 'dashicons dashicons-format-image',
            'content_template' => '
                <# if ( data.image ) { #>
                    <# if ( data.image.type == \'\'  && data.image.url ) { #>
                        <img src="{{ data.image.url }}" alt="">
                    <# } #>
                    <# if ( data.image.type != \'\' && data.image.url ) { #>
                        <video width="400" muted controls>
                            <source src="{{ data.image.url }}" type="{{ data.image.type }}">
                            '.esc_html__( 'Your browser does not support HTML5 video.', 'textdomain' ).'
                        </video>
                    <# } #>
                <# } #>',
            'fields' => array(
                array(
                    'id' => 'image',
                    'type' => 'media',
                    'title' => esc_html__('Image', 'texdomain'),
                    //'desc' => __('Desc Here', 'texdomain'),
                ),
                array(
                    'id' => 'size',
                    'type' => 'select',
                    'title' => esc_html__('Image size', 'texdomain'),
                    'options' => $image_sizes,
                    'default' => 'medium'
                )
            )
        );

        $items['gallery'] = array(
            'id' => 'gallery',
            'title' => esc_html__('Gallery', 'texdomain'),
            'desc' => esc_html__('Insert images', 'texdomain'),
            'icon'  => 'dashicons dashicons-format-gallery',
            'content_template' => '
                <# if ( data.gallery ) { #>
                 <div class="fame-gallery" data-columns="{{ data.gallery.config.columns }}">
                    <# _.each( data.gallery.items, function( item ) { 
                        #>
                        <div class="gallery-item">
                            <img src="{{ item.thumb }}" alt=""/>
                        </div>
                        <#
                    } );  #>
                 </div>
                <# } #>',
            'fields' => array(
                array(
                    'id' => 'gallery',
                    'type' => 'gallery',
                    'title' => esc_html__('Gallery', 'texdomain'),
                    'desc' => __('Desc Here', 'texdomain'),
                    'default' => __('Default value', 'texdomain'),
                )
            )
        );

        $items = apply_filters( 'fame_builder_items', $items );

        // Ensure item is unique
        $new_array = array();
        foreach ( ( array ) $items as $item ) {
            $item = wp_parse_args( $item, array(
                'id' => '',
                'title' => '',
                'desc' => '',
                'icon' => '',
                'icon_type' => '', // can be url or icon
                'content_template' => '',
                'is_settings' => false,
                'fields' => array(),
            ) );

            $item['icon_type'] = ( filter_var( $item['icon'] , FILTER_VALIDATE_URL ) ) ? 'url' : 'icon' ;
            if ( is_array( $item['fields'] ) && ! empty( $item['fields'] ) ) {
                $item['is_settings'] = true;
            } else {
                $item['is_settings'] = false;
                $item['fields'] = array();
            }

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
                    'id' => 'title',
                    'type' => 'text',
                    'title' => esc_html__( 'Title', 'texdomain' ),
                    'desc' => __( 'Custom section title', 'texdomain' ),
                    'default' => '',
                ),
                array(
                    'id' => 'id',
                    'type' => 'text',
                    'title' => esc_html__( 'ID', 'texdomain' ),
                    'desc' => __( 'Custom section ID', 'texdomain' ),
                    'default' => '',
                ),
                array(
                    'id' => 'class',
                    'type' => 'text',
                    'title' => esc_html__( 'Row class', 'texdomain' ),
                    'desc' => __( 'Custom row class', 'texdomain' ),
                    'default' => '',
                ),
                array(
                    'id' => 'columns',
                    'type' => 'select',
                    'title' => esc_html__( 'Columns', 'texdomain' ),
                    'desc' => __( 'Number column to display', 'texdomain' ),
                    'default' => 1,
                    'options' => $columns
                ),
                array(
                    'id' => 'bgcolor',
                    'type' => 'color',
                    'title' => esc_html__( 'Background color', 'texdomain' ),
                ),
                array(
                    'id' => 'desc',
                    'type' => 'textarea',
                    'title' => esc_html__( 'Description', 'texdomain' ),
                    'desc' => __( 'Something about this row', 'texdomain' ),
                    'default' => '',
                )
            )
        );
        return apply_filters( 'fame_builder_row_config', $config );
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
                    'desc' => __( 'Custom section ID', 'texdomain' ),
                    'default' => '',
                ),
                array(
                    'id' => 'class',
                    'type' => 'text',
                    'title' => esc_html__( 'Row class', 'texdomain' ),
                    'desc' => __( 'Custom row class', 'texdomain' ),
                    'default' => '',
                ),
                array(
                    'id' => 'bgcolor',
                    'type' => 'color',
                    'title' => esc_html__( 'Background color', 'texdomain' ),
                ),
                array(
                    'id' => 'desc',
                    'type' => 'textarea',
                    'title' => esc_html__( 'Description', 'texdomain' ),
                    'desc' => __( 'Something about this column', 'texdomain' ),
                    'default' => '',
                )
            )
        );
        return apply_filters( 'fame_builder_row_config', $config );
    }

    function get_defined_templates(  $post_not_in = array() ){
        $templates = array();
        $args = array(
            'meta_key'     => Fame_Builder::$content_key,
            'meta_value'   => 'builder',
            'meta_compare' => 'LIKE',
            'post_type'   => 'any',
            'post_status' =>  array( 'publish', 'future' ),
            'post__not_in' => $post_not_in
        );
        $query = new WP_Query( $args );
        $posts = $query->get_posts();
        foreach ( $posts as $k =>  $p ) {
            $builder_content = self::get_builder_content( $p->ID );
            if ( ! empty( $builder_content ) ) {
                $templates[ $p->ID ] = array(
                    'title' =>  $p->post_title,
                    'data' => json_encode( $builder_content ),
                    'id' => $p->ID
                );
            }

        }

        return apply_filters( 'fame_builder_get_defined_templates', $templates );
    }

    function get_config(){
        global $post;
        $config = array(
            'default_row_col' => 1, // 50%
            'max_columns' => 12,
            'min_columns' => 2, //
            'row' => $this->get_row_config(),
            'col' => $this->get_col_config(),
            'items' => $this->get_items_config(),
            'open_setting_when_new' => true,
            'hide_switcher_if_template' => true,
            'defined_templates' => $this->get_defined_templates( array( $post->ID ) ),
            'nonce' => wp_create_nonce( 'fame_builder' ),
            'builder_templates' => array( // list files using page builder
                "template-builder.php",
                "tpl-builder.php",
                "builder.php"
            ),
            'texts' => array(
                'confirm_remove' => __( 'Are you sure want to remove ?', 'textdomain' ),
                'new_item_modal' => __( 'Add new item', 'textdomain' ),
                'switch_builder' => __( 'Switch to builder', 'textdomain' ),
                'switch_editor'  => __( 'Switch to editor', 'textdomain' ),
            ),
        );
        return apply_filters( 'fame_builder_config', $config );
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
        wp_enqueue_script( 'fame-builder-items', FAME_BUILDER_URL.'admin/assets/js/builder-items.js', array( 'jquery' ), false, true );
        wp_enqueue_script( 'fame-builder', FAME_BUILDER_URL.'admin/assets/js/builder.js', array( 'jquery' ), false, true );
        wp_localize_script( 'fame-builder', 'FAME_BUILDER', $this->get_config() );
        include dirname( __FILE__ ).'/admin/interface.php';
    }
}

global $Fame_Builder;
$Fame_Builder = new Fame_Builder();
