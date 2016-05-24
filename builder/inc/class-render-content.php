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

        $row['settings'] = wp_parse_args( $row['settings'], array(
            '_builder_type' => 'row',
            'title' => '',
            'id' => '',
            'class' => '',
            'bgcolor' => '',
            'desc' => '',
        ) );

        $row_wrapper_args = array (
            'tag' => 'div',
            'atts' => array(
                'class' => array(
                    'builder-container', 'container'
                ),
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

        $row_html = '';

        $row_html .= $this->render_html_open_tag( $row_wrapper_args );
        $row_html .= $this->render_html_open_tag( $row_args );

            if ( ! empty( $row['columns'] ) ) {
                foreach ( ( array ) $row['columns'] as $c_index => $column ) {
                    $row_html .= $this->render_column( $column );
                }
            }

        $row_html .= $this->render_html_close_tag( $row_args );
        $row_html .= $this->render_html_close_tag( $row_wrapper_args );



        return $row_html;
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



        $column_html = '';
        $column_html .= $this->render_html_open_tag( $col_args );
            foreach ( ( array ) $column['items'] as $item_index => $item ) {
                $column_html .= $this->render_item( $item );
            }
        $column_html .= $this->render_html_close_tag( $col_args );
        return $column_html;
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

        $item_args = array (
            'tag' => 'div',
            'atts' => array(
                'class' => array(
                    'builder-item',
                    'builder-item-'.$item['_builder_id']
                ),
            ),
        );
   
        return $this->render_html_open_tag( $item_args ).$html.$this->render_html_close_tag( $item_args );;
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