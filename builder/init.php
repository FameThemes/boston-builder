<?php

class Fame_Builder {
    function __construct()
    {
        define( 'FAME_BUILDER_URL', self::get_url( __FILE__ ) );
        define( 'FAME_BUILDER_PATH', trailingslashit( dirname( __FILE__ ) ) );
        add_action( 'edit_form_after_title', array( $this, 'builder_interface' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'builder_css' ) );
        add_action( 'admin_footer', array( $this, 'wp_editor_tpl' ) );
    }

    function wp_editor_tpl(){
        ?>
        <script id="_wp-mce-editor-tpl" type="text/html">
            <?php  wp_editor('', '__wp_mce_editor__'); ?>
        </script>
        <?php
    }

    /**
     * Get url of any dir
     *
     * @param string $file full path of current file in that dir
     * @return string
     */
    static function get_url( $file = '' ){
        if ( ! $file ) {
            return $file;
        }
        if ( 'WIN' === strtoupper( substr( PHP_OS, 0, 3 ) ) ) {
            // Windows
            $content_dir = str_replace( '/', DIRECTORY_SEPARATOR, WP_CONTENT_DIR );
            $content_url = str_replace( $content_dir, WP_CONTENT_URL, trailingslashit( dirname( $file  ) ) );
            $url = str_replace( DIRECTORY_SEPARATOR, '/', $content_url );
        } else {
            $url = str_replace(
                array( WP_CONTENT_DIR, WP_PLUGIN_DIR ),
                array( WP_CONTENT_URL, WP_PLUGIN_URL ),
                trailingslashit( dirname( $file  ) )
            );
        }
        return set_url_scheme( $url );
    }

    function builder_css( $hook ){
        if ( $hook == 'post.php' || $hook == 'post-new.php' ) {
            wp_enqueue_style( 'fame-builder', FAME_BUILDER_URL.'admin/assets/css/builder.css'  );
            wp_enqueue_style( 'wp-color-picker' );
            wp_enqueue_style( 'jquery-ui'  );
        }
    }

    function builder_interface( $post )
    {
        wp_enqueue_script( 'jquery' );
        wp_enqueue_script( 'jquery-ui-core' );
        wp_enqueue_script( 'jquery-ui-sortable' );
        wp_enqueue_script( 'jquery-ui-resizable' );
        wp_enqueue_script( 'jquery-ui-draggable' );
        wp_enqueue_script( 'wp-color-picker' );

        wp_enqueue_media();

        wp_enqueue_script( 'fame-editor', FAME_BUILDER_URL.'admin/assets/js/editor.js', array( 'jquery' ), false, true );
        wp_enqueue_script( 'fame-builder', FAME_BUILDER_URL.'admin/assets/js/builder.js', array( 'jquery' ), false, true );

        include dirname( __FILE__ ).'/admin/interface.php';
    }
}

new Fame_Builder();