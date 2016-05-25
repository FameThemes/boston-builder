<?php

class Fame_Builder_Render_Content {
    public $items;
    function __construct( )
    {
        $this->items = Fame_Builder::get_items_config();
        add_filter( 'the_content', array( $this, 'filter_post_content' ), 1 );
        add_action( 'wp_enqueue_scripts', array( $this, 'scripts' ) );
    }

    function scripts(){
        wp_enqueue_style( 'fame-builder', FAME_BUILDER_URL . 'assets/css/frontend.css' );
    }

    function filter_post_content( $content = '' ){
        $post = get_post();
        if ( Fame_Builder::get_content_type( $post->ID ) == 'builder' ) {
            $content = $this->render( $post->ID );
        }
        return $content;
    }

    function render( $post_id ){
        $content = '';
        $data = Fame_Builder::get_builder_content( $post_id );
        if ( is_array( $data ) && ! empty( $data ) ) {
            foreach ( $data as $r_index => $row ) {
                $content.= $this->render_row( $row );
            }
        }
        return $content;
    }

    function render_html_open_tag( $args ){
        $args = wp_parse_args( $args, array (
            'tag' => 'div',
            'atts' => array(),
        ) );

        if ( ! $args['tag'] ) {
            $args['tag'] = 'div';
        }

        $atts = array();
        if ( is_array( $args['atts'] ) && ! empty( $args['atts'] ) ) {
            foreach ( ( array ) $args['atts'] as $k => $v ) {
                if ( $v ) {
                    if (is_array($v)) {
                        $v = array_filter( $v );
                        $v = join(" ", $v);
                    }
                    $atts[ $k ] = sanitize_title($k) . '="' . esc_attr($v) . '"';
                }
            }
        }

        if ( ! empty( $atts ) ) {
            $atts = ' '.join( ' ', $atts ).' ';
        }

        return '<'.$args['tag'].$atts.'>';
    }

    function render_html_close_tag( $args ){
        $args = wp_parse_args( $args, array (
            'tag' => 'div',
        ) );
        if ( ! $args['tag'] ) {
            $args['tag'] = 'div';
        }
        return '</'.$args['tag'].'>';
    }

    function render_row( $row ){
        $row = wp_parse_args( $row, array(
            'settings' => array(),
            'columns' => array(),
        ) );

        $settings = wp_parse_args( $row['settings'], array(
            '_builder_type' => 'row',
            'title' => '',
            'id' => '',
            'class' => '',
            'bgcolor' => '',
            'desc' => '',
        ) );

        $style = '';


        $row_html =  apply_filters( 'fame_builder_render_row_tpl', '', $settings, $this );
        $column_html = '';

        if ( ! $row_html ) {

            if ( $settings['bgcolor'] != '' ) {
                if ( preg_match('|^#([A-Fa-f0-9]{3}){1,2}$|', $settings['bgcolor'] ) ) {
                    $style = 'background-color: '.$settings['bgcolor'].';';
                } else {
                    $settings['bgcolor'] = '';
                }
            }

            $row_wrapper_args = array (
                'tag' => 'div',
                'atts' => array(
                    'class' => array(
                        'builder-container', 'container',
                        ( string ) $settings['class']
                    ),
                    'style' => $style,
                    'id' => $settings['id']
                ),
            );
            $row_args = array (
                'tag' => 'div',
                'atts' => array(
                    'class' => array(
                        'builder-row', 'row'
                    ),
                ),
            );

            $row_wrapper_args = apply_filters('fame_builder_render_row_wrapper_args', $row_wrapper_args, $settings );
            $row_args = apply_filters('fame_builder_render_row_args', $row_args, $settings);

            $row_html .= $this->render_html_open_tag( $row_wrapper_args );
            $row_html .= $this->render_html_open_tag( $row_args );
            $row_html .= '{{columns}}';
            $row_html .= $this->render_html_close_tag( $row_args );
            $row_html .= $this->render_html_close_tag( $row_wrapper_args );
        }


        if ( ! empty( $row['columns'] ) ) {
            foreach ( ( array ) $row['columns'] as $c_index => $column ) {
                $column_html .= $this->render_column( $column );
            }
        }

        return str_replace( '{{columns}}', $column_html, $row_html );
    }

    function render_column( $column ){

        $column = wp_parse_args( $column, array(
            'settings' => array(),
            'items'    => array()
        ) );

        $settings = wp_parse_args( $column['settings'], array(
            '_builder_type' => '',
            '_builder_col' => 12,
            'id' => '',
            'class' => '',
            'bgcolor' => '',
            'desc' => '',
        ) );

        $items_html = '';
        $column_html = apply_filters( 'fame_builder_render_column_tpl', '', $settings, $this );

        if ( ! $column_html ) {
            $style = '';
            if ( $settings['bgcolor'] != '' ) {
                if ( preg_match('|^#([A-Fa-f0-9]{3}){1,2}$|', $settings['bgcolor'] ) ) {
                    $style = 'background-color: '.$settings['bgcolor'].';';
                } else {
                    $settings['bgcolor'] = '';
                }
            }

            $col_args = array (
                'tag' => 'div',
                'atts' => array(
                    'class' => array(
                        'builder-col',
                        'col-md-'.$settings['_builder_col'],
                        ( string ) $settings['class']
                    ),
                    'id' => $settings['id'],
                    'style' => $style
                ),
            );

            $col_args = apply_filters('fame_builder_render_row_args', $col_args, $settings, $this );
            $column_html .= $this->render_html_open_tag( $col_args );
            $column_html .= '{{items}}';
            $column_html .= $this->render_html_close_tag( $col_args );
        }

        foreach ( ( array ) $column['items'] as $item_index => $item ) {
            $items_html .= $this->render_item( $item );
        }

        return  str_replace( '{{items}}', $items_html, $column_html );
    }

    function render_item( $item ){
        $html = '';
        $item = wp_parse_args( $item, array(
            '_builder_type' => 'item',
            '_builder_id' => 'text',
        ));

        $config = $this->get_item_by_id( $item['_builder_id'] );
        if ( ! $config ) {
            return $html;
        }

        $file = $this->load_item_template( $item['_builder_id'] );
        $args = $this->parse_args( $item, $config['fields'] );
        if ( $file ) {
            ob_start();
            include $file;
            $html = ob_get_clean();
        }
        $item_wrap = apply_filters( 'fame_builder_render_item_content', '', $item, $this );
        if ( ! $item_wrap ) {
            $item_args = array(
                'tag' => 'div',
                'atts' => array(
                    'class' => array(
                        'builder-item',
                        'builder-item-' . $item['_builder_id']
                    ),
                ),
            );
            $item_args = apply_filters('fame_builder_render_item_args', $item_args, $item, $this );
            $item_wrap = $this->render_html_open_tag($item_args) . '{{item_content}}' . $this->render_html_close_tag($item_args);
        }

        return  str_replace( '{{item_content}}', $html, $item_wrap );
    }

    function get_item_by_id( $item_id ){
        if ( ! $item_id ) {
            return false;
        }
        if ( isset( $this->items[ $item_id ] ) ) {
            return $this->items[ $item_id ];
        }
        return false;
    }

    function parse_args( $data, $fields ){
        foreach ( $fields as $field ) {
            if ( ! isset( $data[ $field['id'] ] ) ) {
                $data[ $field['id'] ] = $field['default'];
            }
        }
        return $data;
    }

    function load_item_template( $item_id ){
        // try to find in child theme / theme first first

        $item_id = ( string ) $item_id;
        $file = apply_filters( 'fame_builder_load_item_template', false, $item_id );
        if ( ! $file ) {
            $templates = array(
                'templates/builder/' . $item_id . '.php',
                'templates-parts/builder/' . $item_id . '.php'
            );
            $file = locate_template($templates, false, false);
            if (!$file) {
                if (file_exists(FAME_BUILDER_PATH . 'templates/' . $item_id . '.php')) {
                    $file = FAME_BUILDER_PATH . 'templates/' . $item_id . '.php';
                }
            }
        }

        return $file;
    }

}
global $Fame_Builder_Render_Content;
$Fame_Builder_Render_Content = new Fame_Builder_Render_Content();