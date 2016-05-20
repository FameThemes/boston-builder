/**
 * Created by truongsa on 5/17/16.
 */

/*!
 * jQuery serializeObject - v0.2 - 1/20/2010
 * http://benalman.com/projects/jquery-misc-plugins/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Whereas .serializeArray() serializes a form into an array, .serializeObject()
// serializes a form into an (arguably more useful) object.

(function($,undefined){
    '$:nomunge'; // Used by YUI compressor.

    $.fn.serializeObject = function(){
        var obj = {};

        $.each( this.serializeArray(), function(i,o){
            var n = o.name,
                v = o.value;

            obj[n] = obj[n] === undefined ? v
                : $.isArray( obj[n] ) ? obj[n].concat( v )
                : [ obj[n], v ];
        });

        return obj;
    };

})(jQuery);


function string_to_number( string ) {
    if ( typeof string === 'number' ) {
        return string;
    }
    var n  = string.match(/\d+$/);
    if ( n ) {
        return parseFloat( n[0] );
    } else {
        return 0;
    }
}

function string_to_bool( v ) {
    if (  typeof v === 'boolean' ){
        return v;
    }

    if (  typeof v === 'number' ){
        return v === 0  ? false : true;
    }

    if (  typeof v === 'string' ){
        if ( v === 'true' || v === '1' ) {
            return true;
        } else {
            return false;
        }
    }

    return false;
}



jQuery( document ).ready( function ( $ ) {
    
    var body = $( 'body' ),
        fame_editing_item = false,
        fame_selected_item = false,
        fame_new_item_modal,
        builder_area = $( '.fame-builder-area' );

    $( '.fame-builder' ).removeAttr( 'style' ).removeClass( 'hide' );

    // Fixed toolbar

    function set_toolbar(){
        var toolbar = $( '.fame-builder-toolbar', body );
        toolbar.wrap( '<div class="fame-builder-toolbar-wrap"></div>' );
        var toolbar_wrap = toolbar.parent();
        toolbar_wrap.height( toolbar.outerHeight() );
        var tw = toolbar_wrap.width();
        toolbar.css( { width:  tw+'px' } );
        $( window ).resize( function(){
            var tw = toolbar_wrap.width();
            toolbar.css( { width:  tw+'px' } );
        } );
        $( window ).scroll( function(){
            var st = $( window ) .scrollTop();
            var t = 0;
            if ( $( '#wpadminbar' ).css( 'position' ) === 'fixed' ) {
                t = $( '#wpadminbar' ).height();
            }

            var max_top = $( '.fame-builder', body ).offset().top;
            max_top += $( '.fame-builder', body ).height();
            max_top -= toolbar.height();

            if ( st > toolbar_wrap.offset().top - t && st < max_top) {
                toolbar_wrap.addClass( 'fame-fixed' );
                toolbar.css( { top:  t+'px' } );
            } else {
                toolbar_wrap.removeClass( 'fame-fixed' );
                toolbar.css( { top:  'auto' } );
            }
            //toolbar.css( { top: t, left: l, position: 'fixed' });
        } );
    }
    set_toolbar();

    function get_template( tmpl_id, data ){
        if ( typeof data === "undefined" ) {
            data = {};
        }
        /**
         * Function that loads the Mustache template
         */
        var t = _.memoize( function ( _tmpl_id, _data ) {
            var compiled,
            /*
             * Underscore's default ERB-style templates are incompatible with PHP
             * when asp_tags is enabled, so WordPress uses Mustache-inspired templating syntax.
             *
             * @see track ticket #22344.
             */
            options = {
                evaluate: /<#([\s\S]+?)#>/g,
                interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
                escape: /\{\{([^\}]+?)\}\}(?!\})/g,
                variable: 'data'
            };
            var html = $( '#' +_tmpl_id ).html();
            //console.log( html );
            compiled = _.template( html, null, options);
            return compiled( _data );
        });

        return t( tmpl_id,  data );
    }


    function render_template_by_html( template_html, data ){
        if ( typeof data === "undefined" ) {
            data = {};
        }

        $.each( data, function( key, val ) {
            if ( typeof val === 'string' ) {
                data[ key ] = window.switchEditors._wp_Autop( val );
            }
        } );


        /**
         * Function that loads the Mustache template
         */
        var t = _.memoize( function ( ) {
            var compiled,
            /*
             * Underscore's default ERB-style templates are incompatible with PHP
             * when asp_tags is enabled, so WordPress uses Mustache-inspired templating syntax.
             *
             * @see track ticket #22344.
             */
                options = {
                    evaluate: /<#([\s\S]+?)#>/g,
                    interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
                    escape: /\{\{([^\}]+?)\}\}(?!\})/g,
                    variable: 'data'
                };

            compiled = _.template( template_html, null, options);
            return compiled( data );
        });

        return t( );
    }

    function get_item_by_id( item_id ){
        if ( typeof item_id !== 'string' && typeof item_id !== 'number' ) {
            return false;
        }

        if ( typeof FAME_BUILDER.items[ item_id ] !== "undefined" ) {
            return FAME_BUILDER.items[ item_id ];
        }

        return false;
    }


    function update_data(){
        var save_data = {};
        // loop rows
        $( '.fame-block-row', builder_area ).each( function( row_index ){
            var r =  $( this );
            save_data[ row_index ] = {
                settings: {},
                columns: [],
            };
            save_data[ row_index ].settings = r.prop( 'builder_data' );

            // loop column
            $( '.fame-block-body .fame-block-col', r ).each( function( column_index ) {
                var c =  $( this );
                var column_data = {
                    settings: {},
                    items: [],
                };
                column_data.settings = c.prop( 'builder_data' );
                var items_data = [];
                // loop item

                $( '.block-col-inner .fame-block-item', c ).each( function( item_index ){
                    items_data[ item_index ] =  $( this ).prop( 'builder_data' );
                } );
                column_data.items = items_data;
                save_data[ row_index ].columns[ column_index ] = column_data;
            });

        } );

        $( '.fame_builder_content', body ).val( JSON.stringify( save_data ) );

    }

    // Sortable rows
    $( ".fame-builder-area", body ).sortable({
        //tolerance: "pointer",
        handle: '.fame-block-header',
        zIndex: 99999,
        update: function( event, ui ) {
            update_data();
        }
    });

    function update_columns_class() {
        $( '.fame-block-body', body ).each( function(){
            var r = $( this );
            var c = $( this ).attr( 'data-columns' ) || 0;
            c = parseInt( c );
            var i = 0;
            $( '.fame-block-col', r ).removeClass( 'first' );
            $( '.fame-block-col', r ).not( '.ui-sortable-helper' ).each( function( index ) {
                i++;
                if ( i > c ) {
                    $( this ).addClass( 'first' );
                    i = 0;
                }
            } );
        } );
    }

    function sort_columns ( context ) {
        if ( typeof context === "undefined" ){
            context = $( 'body' );
        }

        /*
        $(".fame-block-body", context ).sortable({
            handle: '.fame-col-move',
            placeholder: 'fame-block-col fame-placeholder',
            forcePlaceholderSizeType: true,
            forceHelperSize: true,
            refreshPositions: true,
            distance: 2,
            tolerance: 'pointer',
            zIndex: 99999,
            //connectWith: ".fame-block-body",
            // containment: "parent",
            //helper: "clone",
            start: function (event, ui) {
                update_columns_class();
            },
            sort: function (event, ui) {
                update_columns_class();
            },
            stop: function (event, ui) {
                update_columns_class();
            },
            update: function( event, ui ) {
                update_data();
            }
        });
        */


        $(".block-col-inner", context ).sortable({
            handle: '.fame-item-move',
            ///placeholder: 'fame-block-item fame-placeholder',
            forcePlaceholderSizeType: true,
            forceHelperSize: true,
            refreshPositions: true,
            distance: 2,
            tolerance: 'pointer', // intersect | pointer
            zIndex: 99999,
            connectWith: '.block-col-inner',
            // containment: "parent",
            //helper: "clone",
            start: function (event, ui) {
                update_columns_class();
            },
            sort: function (event, ui) {
                update_columns_class();
            },
            stop: function (event, ui) {
                update_columns_class();
            },
            update: function( event, ui ) {
                update_data();
            }
        });
    }
    sort_columns();

    // When remove row
    body.on( 'click', '.fame-block-row .fame-row-remove', function( e ) {
        e.preventDefault();
        $( this ).closest( '.fame-block-row ' ).remove();
        update_data();
    } );


    /**
     *  Input fields -----------------------------------------------
     */

    // Wp upload
    var frame = wp.media({
        title: wp.media.view.l10n.addMedia,
        multiple: false,
        //library: {type: 'all' },
        //button : { text : 'Insert' }
    });

    frame.on('close', function () {
        // get selections and save to hidden input plus other AJAX stuff etc.
        //var selection = frame.state().get('selection');
        // console.log(selection);
    });

    fame_editing_media = false;

    frame.on( 'select', function () {
        // Grab our attachment selection and construct a JSON representation of the model.
        var media_attachment = frame.state().get('selection').first().toJSON();

        var preview, img_url;
        img_url = media_attachment.url;
        if ( fame_editing_media ) {
            var p = fame_editing_media.closest('.fame-media');
            p.addClass( 'added' );

            $('.fame-attachment-id', p).val(media_attachment.id);
            $('.fame-attachment-url', p).val(img_url);

            if ( media_attachment.type == 'image' ) {
                fame_editing_media.css('background-image', 'url("' + img_url + '")');
            } else if (media_attachment.type == 'video') {
                preview = '<video width="400" muted controls>' +
                    '<source src="' + img_url + '" type="' + media_attachment.mime + '">' +
                    'Your browser does not support HTML5 video.' +
                    '</video>';
                fame_editing_media.css('background-image', '');
                fame_editing_media.html(preview);
            }
        }

        fame_editing_media = false;

    });


    // Image handle
    body.on( 'click', '.fame-media-preview', function( e ) {
        e.preventDefault();
        fame_editing_media = $( this );
        frame.open();
    } );
    body.on( 'click', '.fame-media-remove', function( e ) {
        e.preventDefault();
        var p = $( this ).closest( '.fame-media' );
        p.removeClass( 'added' );
        p.find( '.fame-media-preview' ).css( 'background-image', '' ).html( '' );
        $( '.fame-attachment-id', p  ).val( '' );
        $( '.fame-attachment-url', p ).val( '' );
    } );

    function input_fields( $context ){
        $( '.color-picker', $context ).wpColorPicker();
        $( '.editor', $context ).wp_js_editor();
    }


    /**
     * EN Input fields -----------------------------------------------
     */

    function set_modal_size( modal ){
        var set_pos = function(){
            var w = $( window ).width();
            var h = $( window ).height();
            var cl = $( '#wpcontent' ).offset().left;
            var mw = 600;
            var mh = 600;
            if (  mw > w ) {
                mw = w;
            }
            if (  mh > h - 100 ) {
                mh = h - 100;
            }
            var ml = ( w - mw ) / 2;
            var mt = ( h - mh ) / 2;
            modal.css( { left: ml , width: mw,  height: mh, top: mt } );
        };

        set_pos();
        $( window ).resize( function(){
            set_pos();
        } );

    }

    function setup_fields_data( fields, data_save ){
        if ( typeof data_save !== "object" ) {
            data_save = {};
        }
        var is_empty_data = $.isEmptyObject( data_save );

        $.each( fields, function( index, field ){
            fields[ index ] = $.extend( {}, {
                id: '',
                default: '',
                value: '',
            }, field );
            fields[ index ].value = '';
            if ( is_empty_data ) {
                fields[ index ].value = fields[ index ].default;
            } else {
                if ( typeof data_save[ field.id ] !== "undefined" ) {
                    fields[ index ].value = data_save[ field.id ];
                }
            }

        } );
        return fields;
    }

    function open_modal( data, fields ){
        data.html = get_template( 'fame-builder-fields-tpl', fields );
        var modal = get_template( 'fame-builder-modal-tpl', data );
        $('.fame-item-modal' , body ).remove();
        modal = $( modal );
        $( '.fame-modal-drop' ).remove();
        body.append( '<div class="fame-modal-drop"></div>' );
        body.append( modal );
        set_modal_size( modal );
        input_fields( modal );
    }

    // Close modal
    function remove_modal(){
        $( '.fame-modal-item.type-editor .wp-editor-area', body ).wp_js_editor( 'remove' );

        $('.fame-item-modal' , body ).hide();
        $('.fame-modal', body ).hide();
        $( '.fame-modal-drop', body ).remove();

    }
    body.on( 'click', '.fame-modal .fame-modal-remove, .fame-modal-drop', function( e){
        e.preventDefault();
        remove_modal();
    } );

    
    // Item settings modal
    body.on( 'click', '.fame-block-item .fame-item-settings', function( e){
        e.preventDefault();
        var item_id = 'text';
        var data = get_item_by_id( item_id );
        fame_editing_item = $( this ).closest( '.fame-block-item' );
        var save_value = fame_editing_item.prop( 'builder_data' );
        var d = setup_fields_data( data.fields, save_value );
        open_modal( data, d );
    } );

    // Column settings modal
    body.on( 'click', '.fame-block-col .fame-col-settings', function( e){
        e.preventDefault();
        var data = FAME_BUILDER.col || {};
        fame_editing_item = $( this ).closest( '.fame-block-col' );
        open_modal( data, setup_fields_data( data.fields, fame_editing_item.prop( 'builder_data' ) ) );
    } );

    // Row settings modal
    body.on( 'click', '.fame-block-row .fame-row-settings', function( e){
        e.preventDefault();
        var data = FAME_BUILDER.row || {};
        fame_editing_item = $( this ).closest( '.fame-block-row' );
        open_modal( data, setup_fields_data( data.fields, fame_editing_item.prop( 'builder_data' ) ) );
    } );

    // Modal Row/Column/Item save
    body.on( 'click', '.fame-builder-save', function ( e ){
        e.preventDefault();
        var old_data =  fame_editing_item.prop( 'builder_data' );
        var new_data = $( 'form.fame-modal-body-inner' ).serializeObject();
        new_data = $.extend( {}, old_data , new_data );
        fame_editing_item.prop( 'builder_data', new_data );

        remove_modal();
        update_data();

        body.trigger( 'builder_data_setting_update', [ fame_editing_item, new_data ] );
    } );

    // Open modal add new item
    fame_new_item_modal = get_template( 'fame-builder-add-items-tpl', {} );
    $( '.fame-modal-drop' ).remove();
    fame_new_item_modal = $( fame_new_item_modal );
    fame_new_item_modal.hide();
    body.append( fame_new_item_modal );
    set_modal_size( fame_new_item_modal );
    body.on( 'click', '.new-item', function( e ){
        e.preventDefault();
        body.append( '<div class="fame-modal-drop"></div>' );
        fame_new_item_modal.show();
    } );
    // End modal

    // Add new column
    function new_item_object( data ){
        var save_values = _.clone( data );
        save_values = $.extend( {}, {
            _builder_type: 'item',
            _builder_id:    'text',
        }, save_values );
        save_values._builder_type = 'item';
        var config = get_item_by_id( save_values._builder_id );
        config.fields = setup_fields_data( config.fields, save_values );
        var o = get_template( 'fame-builder-item-tpl', config );
        o = $( o );

        // Update preview
        if ( typeof config.preview !== "undefined" ){
            var preview = render_template_by_html( config.preview, save_values );
            $( '.fame-item-preview', o ).html( preview );
            var content = $( '.fame-item-preview', o ).html();
            if ( content && content.trim() !== '' ) {
                o.addClass( 'has-preview' );
            } else {
                o.removeClass( 'has-preview' );
            }
        }

        o.prop( 'builder_data', save_values );
        return o;
    }

    // Add new column
    function new_column_object( settings ){
        settings = $.extend( {}, {
            _builder_type: 'column',
            _builder_col: Math.round( FAME_BUILDER.max_columns / FAME_BUILDER.default_row_col ),
        }, settings );

        settings._builder_type = 'column';
        var c = get_template( 'fame-builder-col-tpl', settings );
        c = $( c );
        c.attr( 'data-col', settings._builder_col );
        c.prop( 'builder_data', settings );
        sort_columns( c );
        return c;
    }

    // Add new row
    function new_row_object( settings ){
        settings = $.extend( {}, {
            _builder_type: 'row',
        }, settings );
        settings._builder_type = 'row';
        var r = get_template( 'fame-builder-row-tpl', settings );
        r = $( r );
        r.prop( 'builder_data', settings );
        sort_columns( r );
        return r;
    }

    function add_row_object( data ){
        data = $.extend( {}, {
            settings: {},
            columns: [],
        }, data );

        data.settings = $.extend( {}, {
            columns: '',
            title: '',
            id: '',
        }, data.settings );

        var r = new_row_object( data.settings );

        var num_col = string_to_number( data.settings.columns );
        if ( num_col <= 0 ) {
            num_col = FAME_BUILDER.default_row_col;
        }

        $( '.fame-block-body', r ).attr( 'data-columns', num_col );

        var column_data, c;
        for ( var i = 0; i < num_col; i++ ) {
            if ( typeof data.columns[ i ] !== "undefined" ) {
                column_data = data.columns[ i ];
            } else {
                column_data = {}
            }

            column_data = $.extend( {}, {
                settings: {},
                items: [],
            }, column_data );

            column_data.settings = $.extend( {}, {
                title: '',
                id: '',
                _builder_type: 'column',
                _builder_col: Math.round( FAME_BUILDER.max_columns / num_col ),
            }, column_data.settings );

            c = new_column_object( column_data.settings );

            // check items
            if ( typeof column_data.items !== 'array' && typeof column_data.items !== 'object') {
                column_data.items = [];
            }
            var item_data = {}, o;

            for ( var j = 0; j < column_data.items.length; j++ ) {
                if ( typeof column_data.items[ j ] !== "undefined" ) {
                    item_data = column_data.items[ j ];
                } else {
                    item_data = {}
                }
                o = new_item_object( item_data );
                $( '.block-col-inner', c ).append( o );
            }

            $( '.fame-block-body', r ).append( c );

        }

        return r;
    }

    // New row
    body.on( 'click', '.new-row', function( e ){
        e.preventDefault();
        var r = add_row_object();
        $( '.fame-builder-area', body ).append( r );
        update_data();

    } );

    // New item
    body.on( 'click', '.fame-block-col .fame-add', function( e ){
        e.preventDefault();
        $( 'body' ).append( '<div class="fame-modal-drop"></div>' );
        var col = $( this ).closest( '.fame-block-col' );
        fame_selected_item = col;
        fame_new_item_modal.show();
    } );


    // Item selected
    body.on( 'click', '.fame-add-item', function( e ){
        e.preventDefault();
        var item = $( this );
        var item_id = item.attr( 'data-id' ) || '';
        fame_new_item_modal.hide();
        remove_modal();
        var item_config = get_item_by_id( item_id );
        if ( item_id !== '' && item_config ) {
            if ( fame_selected_item ) {
                var col_data = fame_selected_item.prop( 'builder_data' );
                if ( col_data._builder_type == 'column' ) {
                    var data = {
                        _builder_type: 'item',
                        _builder_id:   item_id,
                    };
                    var c = new_item_object( data );
                    $( '.block-col-inner', fame_selected_item ).append( c );
                    fame_editing_item = false;
                    //open_modal( data, setup_fields_data( data.fields, fame_editing_item.prop( 'builder_data' ) ) );
                }
            }
        }

        update_data();
    } );

    // when hit right col
    body.on( 'click', '.fame-block-col .fame-col-r', function( e ){
        e.preventDefault();
        var col = $( this ).closest( '.fame-block-col' );
        var col_data = col.prop( 'builder_data' );
        if ( typeof col_data._builder_col === "undefined" ) {
            col_data._builder_col = Math.round( FAME_BUILDER.max_columns / num_col );
        }

        var index = col.index();
        var num_sib = col.siblings().length;

        if ( num_sib == index ) { // is last child

            if ( col.prev().length > 0 ) {
                var prev_col_data = col.prev().prop( 'builder_data' );
                if ( typeof prev_col_data._builder_col === "undefined" ) {
                    prev_col_data._builder_col = Math.round( FAME_BUILDER.max_columns / num_col );
                }

                if ( col_data._builder_col > FAME_BUILDER.min_columns ) {
                    col_data._builder_col --;
                    prev_col_data._builder_col ++;
                }

                col.prop( 'builder_data', col_data ).attr( 'data-col', col_data._builder_col );
                col.prev().prop( 'builder_data', prev_col_data ).attr( 'data-col', prev_col_data._builder_col );
            }
        } else {
            // if current col has sibling
            if ( col.next().length > 0) {
                var next_col_data = col.next().prop('builder_data');
                if (typeof next_col_data._builder_col === "undefined") {
                    next_col_data._builder_col = Math.round(FAME_BUILDER.max_columns / num_col);
                }

                if (next_col_data._builder_col > FAME_BUILDER.min_columns) {
                    col_data._builder_col++;
                    next_col_data._builder_col--;
                }

                col.prop('builder_data', col_data).attr('data-col', col_data._builder_col);
                col.next().prop('builder_data', next_col_data).attr('data-col', next_col_data._builder_col);
                console.log('run: ' + col_data._builder_col + '|' + next_col_data._builder_col);
            }
        }

        update_data();
    } );

    // when hit left col
    body.on( 'click', '.fame-block-col .fame-col-l', function( e ){
        e.preventDefault();
        var col = $( this ).closest( '.fame-block-col' );
        var col_data = col.prop( 'builder_data' );
        if ( typeof col_data._builder_col === "undefined" ) {
            col_data._builder_col = Math.round( FAME_BUILDER.max_columns / num_col );
        }

        var index = col.index();
        var num_sib = col.siblings().length;

        if ( index == 0 ){ // if current item is first child
            // if current col has next sibling
            if ( col.next().length > 0 ) {
                var next_col_data = col.next().prop( 'builder_data' );
                if ( typeof next_col_data._builder_col === "undefined" ) {
                    next_col_data._builder_col = Math.round( FAME_BUILDER.max_columns / num_col );
                }

                if ( col_data._builder_col > FAME_BUILDER.min_columns ) {
                    col_data._builder_col--;
                    next_col_data._builder_col++;
                }

                col.prop( 'builder_data', col_data ).attr( 'data-col', col_data._builder_col );
                col.next().prop( 'builder_data', next_col_data ).attr( 'data-col', next_col_data._builder_col );
            }
        } else {
            // if current col has prev sibling
            if ( col.prev().length > 0 ) {
                var prev_col_data = col.prev().prop( 'builder_data' );
                if ( typeof prev_col_data._builder_col === "undefined" ) {
                    prev_col_data._builder_col = Math.round( FAME_BUILDER.max_columns / num_col );
                }

                if ( prev_col_data._builder_col > FAME_BUILDER.min_columns ) {
                    col_data._builder_col++;
                    prev_col_data._builder_col--;
                }

                col.prop( 'builder_data', col_data ).attr( 'data-col', col_data._builder_col );
                col.prev().prop( 'builder_data', prev_col_data ).attr( 'data-col', prev_col_data._builder_col );
            }
        }
        update_data();

    } );



    // Event handle when data change
   // fame_editing_item.trigger( 'builder_data_update', [ fame_editing_item, data] );

    body.on( 'builder_data_setting_update', function( e, item, data ) {
        data = $.extend( {}, {
            id: '',
            _builder_type: '',
            _builder_id:   '',
        }, data );

        switch ( data._builder_type ) {
            case 'row':
                if ( typeof data.columns !== "undefined" ) {
                    var n = string_to_number( data.columns );
                    var bd = $( '.fame-block-body', item );
                    var nc = $( '.fame-block-col', bd ).length;
                    bd.attr( 'data-columns', n );
                    $( '.fame-block-col', bd ).each( function(){
                        var data = $( this ).prop( 'builder_data' );
                        var c =  Math.round( FAME_BUILDER.max_columns / n );
                        data._builder_col = c;
                        $( this ).attr( 'data-col', c );
                    } );

                    var i ;
                    if ( n > nc ) {
                        for ( i = 0; i < n - nc; i ++ ) {
                            var tpl_c = new_column_object( { _builder_col: n, } );
                            tpl_c.attr( 'data-col', n );
                            bd.append( tpl_c );
                        }
                    } else  if ( nc > n ) {

                        for ( i = nc - 1; i > n - 1; i -- ) {
                            $( '.fame-block-col', bd ).eq( i ).remove();
                        }
                    }
                }
                break;
            case 'item':
                // Update preview
                var config = get_item_by_id( data._builder_id );
                if ( typeof config.preview !== "undefined" ){
                    var preview = '';
                    preview = render_template_by_html( config.preview, data );
                    $( '.fame-item-preview', item ).html( preview );

                    var content = $( '.fame-item-preview', item ).html();
                    if ( content && content.trim() !== '' ) {
                        item.addClass( 'has-preview' );
                    } else {
                        item.removeClass( 'has-preview' );
                    }
                }
                break;

        } // end switch

    } );

    // When page load
    var data = $( '.fame_builder_content', body ).val();
    try {
        data = JSON.parse( data );
    } catch ( e ) {
        data = {};
    }

    $.each( data, function( index, row ){
        var r = add_row_object( row );
        $( '.fame-builder-area', body ).append( r );
    } );


} );