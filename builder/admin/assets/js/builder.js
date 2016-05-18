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



jQuery( document ).ready( function ( $ ) {
    
    var body = $( 'body' ),
        fame_editing_item = false,
        fame_editing_col = false,
        fame_editing_row = false;
        fame_editing_item_type = '';

    // Loaf view style
    /*
    if (  typeof window.FAME_BUILDER !== "undefined" ) {
        $.each( window.FAME_BUILDER.builder_css, function( key, file ) {
            $('<link>')
                .appendTo('head')
                .attr({type : 'text/css', rel : 'stylesheet'})
                .attr('id', 'fame-builder-css-'+key )
                .attr('href', file );
        });

        $( 'body' ).trigger( 'fame-builder-css-loaded' );
    }
    */

    $( '.fame-builder' ).removeAttr( 'style' ).removeClass( 'hide' );

    // Fixed toolbar

    function set_toolbar(){
        var toolbar = $( '.fame-builder-toolbar' );
        toolbar.wrap( '<div class="fame-builder-toolbar-wrap"></div>' );
        var toolbar_wrap = toolbar.parent();
        toolbar_wrap.height( toolbar.outerHeight() );
        var tw = toolbar_wrap.width();
        console.log( tw );
        toolbar.css( { width:  tw+'px' } );
        $( window ).resize( function(){
            var tw = toolbar_wrap.width();
            toolbar.css( { width:  tw+'px' } );
        } );
        $( window ).scroll( function(){
            var st = $( window ) .scrollTop();
            var l = toolbar_wrap.offset().left;
            var t = 0;
            if ( $( '#wpadminbar' ).css( 'position' ) === 'fixed' ) {
                t = $( '#wpadminbar' ).height();
            }
            if ( st > toolbar_wrap.offset().top - t ) {
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
             * @see trac ticket #22344.
             */
            options = {
                evaluate: /<#([\s\S]+?)#>/g,
                interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
                escape: /\{\{([^\}]+?)\}\}(?!\})/g,
                variable: 'data'
            };
            /*
            return function ( data ) {
                compiled = _.template( jQuery( '#gallery-one-item-tpl').html(), null, options);
                return compiled( data );
            };
            */
            var html = $( '#' +_tmpl_id ).html();
            //console.log( html );
            compiled = _.template( html, null, options);
            return compiled( _data );
        });

        return t( tmpl_id,  data );
    }


    function update_data(){
        console.log( 'data-changed' );
    }

    // Sortable rows
    $( ".fame-builder-area" ).sortable({
        //tolerance: "pointer",
        handle: '.fame-block-header',
        zIndex: 99999,
        update: function( event, ui ) {
            update_data();
        }
    });

    function update_columns_class() {
        $( '.fame-block-body' ).each( function(){
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


        $(".block-col-inner", context ).sortable({
            //handle: '.block-col-inner',
            //placeholder: 'fame-block-col fame-placeholder',
            forcePlaceholderSizeType: true,
            forceHelperSize: true,
            refreshPositions: true,
            distance: 2,
            tolerance: 'pointer',
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



    // Test
    $( 'body' ).on( 'click', '.new-item', function(e ){
        e.preventDefault();
        var r = $( '.fame-block-row' ).eq( 0 ).clone();
        $( '.fame-builder-area ' ).append( r );

        sort_columns( r );
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
    $( 'body' ).on( 'click', '.fame-media-preview', function( e ) {
        e.preventDefault();
        fame_editing_media = $( this );
        frame.open();
    } );
    $( 'body' ).on( 'click', '.fame-media-remove', function( e ) {
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
    // Modal
    function modal (){
        var modal = get_template( 'fame-builder-modal-tpl', {} );
        modal = $( modal );
        $( 'body' ).append( modal );

        /*
         var containment = $( '#wpcontent' ).length > 0 ? '#wpcontent' : false;
         modal.draggable( {
         handle: '.fame-modal-header',
         containment: containment,
         }).resizable({
         minWidth: 150
         });
         */
        input_fields( modal );
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
        modal = $( modal );
        $( '.fame-modal-drop' ).remove();
        $( 'body' ).append( '<div class="fame-modal-drop"></div>' );
        $( 'body' ).append( modal );
        set_modal_size( modal );
        input_fields( modal );
    }

    // Close modal
    function remove_modal(){
        $('.fame-modal' ).remove();
        $( '.fame-modal-drop' ).remove();
        $( this ).closest( '.fame-modal' ).remove();
    }
    body.on( 'click', '.fame-modal .fame-modal-remove', function( e){
        e.preventDefault();
        remove_modal();
    } );

    // Row modal
    body.on( 'click', '.fame-row-settings', function( e){
        e.preventDefault();
    } );

    // Item modal
    body.on( 'click', '.fame-block-item .fame-item-settings', function( e){
        e.preventDefault();
        var item_id = 'text';
        var data = FAME_BUILDER.items[ item_id ] || {};
        fame_editing_item = $( this ).closest( '.fame-block-item' );
        open_modal( data, setup_fields_data( data.fields, fame_editing_item.prop( 'builder_data' ) ) );
    } );

    // Column modal
    body.on( 'click', '.fame-block-col .fame-col-settings', function( e){
        e.preventDefault();
        var data = FAME_BUILDER.col || {};
        fame_editing_item = $( this ).closest( '.fame-block-col' );
        open_modal( data, setup_fields_data( data.fields, fame_editing_item.prop( 'builder_data' ) ) );
    } );

    // Row modal
    body.on( 'click', '.fame-block-row .fame-row-settings', function( e){
        e.preventDefault();
        var data = FAME_BUILDER.row || {};
        fame_editing_item = $( this ).closest( '.fame-block-row' );
        open_modal( data, setup_fields_data( data.fields, fame_editing_item.prop( 'builder_data' ) ) );
    } );

    // Modal save
    body.on( 'click', '.fame-builder-save', function ( e ){
        e.preventDefault();
        var data = $( 'form.fame-modal-body-inner' ).serializeObject();
        fame_editing_item.prop( 'builder_data', data );
        remove_modal();
        update_data();
    } );


    // End modal






} );