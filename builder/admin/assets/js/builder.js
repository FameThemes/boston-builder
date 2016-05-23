/**
 * Created by truongsa on 5/17/16.
 */

/**
 * jQuery serializeObject
 * @copyright 2014, macek <paulmacek@gmail.com>
 * @link https://github.com/macek/jquery-serialize-object
 * @license BSD
 * @version 2.5.0
 */
(function(root, factory) {

    // AMD
    if (typeof define === "function" && define.amd) {
        define(["exports", "jquery"], function(exports, $) {
            return factory(exports, $);
        });
    }

    // CommonJS
    else if (typeof exports !== "undefined") {
        var $ = require("jquery");
        factory(exports, $);
    }

    // Browser
    else {
        factory(root, (root.jQuery || root.Zepto || root.ender || root.$));
    }

}(this, function(exports, $) {

    var patterns = {
        validate: /^[a-z_][a-z0-9_]*(?:\[(?:\d*|[a-z0-9_]+)\])*$/i,
        key:      /[a-z0-9_]+|(?=\[\])/gi,
        push:     /^$/,
        fixed:    /^\d+$/,
        named:    /^[a-z0-9_]+$/i
    };

    function FormSerializer(helper, $form) {

        // private variables
        var data     = {},
            pushes   = {};

        // private API
        function build(base, key, value) {
            base[key] = value;
            return base;
        }

        function makeObject(root, value) {

            var keys = root.match(patterns.key), k;

            // nest, nest, ..., nest
            while ((k = keys.pop()) !== undefined) {
                // foo[]
                if (patterns.push.test(k)) {
                    var idx = incrementPush(root.replace(/\[\]$/, ''));
                    value = build([], idx, value);
                }

                // foo[n]
                else if (patterns.fixed.test(k)) {
                    value = build([], k, value);
                }

                // foo; foo[bar]
                else if (patterns.named.test(k)) {
                    value = build({}, k, value);
                }
            }

            return value;
        }

        function incrementPush(key) {
            if (pushes[key] === undefined) {
                pushes[key] = 0;
            }
            return pushes[key]++;
        }

        function encode(pair) {
            switch ($('[name="' + pair.name + '"]', $form).attr("type")) {
                case "checkbox":
                    return pair.value === "on" ? true : pair.value;
                default:
                    return pair.value;
            }
        }

        function addPair(pair) {
            if (!patterns.validate.test(pair.name)) return this;
            var obj = makeObject(pair.name, encode(pair));
            data = helper.extend(true, data, obj);
            return this;
        }

        function addPairs(pairs) {
            if (!helper.isArray(pairs)) {
                throw new Error("formSerializer.addPairs expects an Array");
            }
            for (var i=0, len=pairs.length; i<len; i++) {
                this.addPair(pairs[i]);
            }
            return this;
        }

        function serialize() {
            return data;
        }

        function serializeJSON() {
            return JSON.stringify(serialize());
        }

        // public API
        this.addPair = addPair;
        this.addPairs = addPairs;
        this.serialize = serialize;
        this.serializeJSON = serializeJSON;
    }

    FormSerializer.patterns = patterns;

    FormSerializer.serializeObject = function serializeObject() {
        return new FormSerializer($, this).
        addPairs(this.serializeArray()).
        serialize();
    };

    FormSerializer.serializeJSON = function serializeJSON() {
        return new FormSerializer($, this).
        addPairs(this.serializeArray()).
        serializeJSON();
    };

    if (typeof $.fn !== "undefined") {
        $.fn.serializeObject = FormSerializer.serializeObject;
        $.fn.serializeJSON   = FormSerializer.serializeJSON;
    }

    exports.FormSerializer = FormSerializer;

    return FormSerializer;
}));


// -------------------------------------


function string_to_number( string ) {
    if ( typeof string === 'number' ) {
        return string;
    }
    if ( typeof string === 'string' ) {
        var n = string.match(/\d+$/);
        if (n) {
            return parseFloat(n[0]);
        } else {
            return 0;
        }
    }
    return 0;
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
        fame_defined_templates,
        builder_area = $( '.fame-builder-area' );
    
    function getItemControl( item ) {
        var item_id = '';
        if ( typeof item === 'string' ) {
            item_id  = item;
        } else {
            item_id = item['id'];
        }
        if ( typeof fame_builder_controls[ item_id ] !== "undefined" ) {
            return fame_builder_controls[ item_id ];
        }
        return false;
    }

    function itemControlMethod( item, method ){
        var c = getItemControl( item );
        if( c ) {
            if ( typeof c[ method ] === "function" ) {
                return c[ method ];
            }
        }
        return false;
    }

    // Fixed toolbar
    function setToolbar(){
        var toolbar = $( '.fame-builder-toolbar', body );
        if ( ! toolbar.parent().hasClass( 'fame-builder-toolbar-wrap' ) ) {
            toolbar.wrap( '<div class="fame-builder-toolbar-wrap"></div>' );
        }
        var toolbar_wrap = toolbar.parent();
        toolbar_wrap.height( 'auto' );
        toolbar_wrap.height( toolbar.outerHeight() );
        var tw = toolbar_wrap.width();
        toolbar.css( { width:  tw+'px' } );
        $( window ).resize( function(){
            var tw = toolbar_wrap.width();
            toolbar.css( { width:  tw+'px' } );
            toolbar_wrap.height( 'auto' );
            toolbar_wrap.height( toolbar.outerHeight() );
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
    setToolbar();

    // Builder switching
    function switch_content_editor( editor_type ){
        // #wp-content-editor-container
        if ( editor_type == 'builder' ) {
            $( '#postdivrich' ).addClass( 'fame-editor-hide' );
            $( '.fame-builder-wrap' ).removeClass( 'fame-builder-hide' );
            $( '.fame-builder-switch-btn' ).html( FAME_BUILDER.texts.switch_editor );

        } else {
            $( '#postdivrich' ).removeClass( 'fame-editor-hide' );
            $( '.fame-builder-wrap' ).addClass( 'fame-builder-hide' );
            $( '.fame-builder-switch-btn' ).html( FAME_BUILDER.texts.switch_builder );

        }
        $( '#fame_post_content_type' ).val( editor_type );
        body.trigger( 'fame_editor_changed', [ editor_type ] );
        $( window ).trigger( 'resize' );
    }
    $( '.fame-builder' ).removeAttr( 'style' ).removeClass( 'hide' );

    switch_content_editor( $( '#fame_post_content_type' ).val() || '' );

    body.on( 'click', '.fame-builder-switch-btn', function( e ) {
        e.preventDefault();
        var t = $( '#fame_post_content_type' ).val() || '';
        if ( t == 'builder' ) {
            t = 'editor';
        } else {
            t = 'builder';
        }
        switch_content_editor( t );
    } );


    if ( $( '#page_template' , body ).length > 0 ) {

        // Check page builder
        if ( FAME_BUILDER.hide_switcher_if_template ) {
            body.addClass( 'hide_switcher_if_template' );
        } else {
            body.addClass( 'fame-has-switcher' );
        }

        $( '#page_template' , body ).on( 'change', function(){
            //console.log( 'dsdsa change' );
            var v = $( this ).val();
            if ( v != '' && FAME_BUILDER.builder_templates.indexOf( v ) > -1 ) {
                switch_content_editor( 'builder' );
            } else {
                switch_content_editor( 'editor' );
            }
        } );

        if ( FAME_BUILDER.hide_switcher_if_template ) {
            $( '#page_template' , body ).trigger( 'change' );
        }

    } else {
        body.addClass( 'fame-has-switcher' );
    }
    

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
        var content = '';
        // loop rows
        $( '.fame-block-row', builder_area ).each( function( row_index ){

            content += '<div class="builder-container container">';
            content += '<div class="builder-row row">';

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
                var item_html = '';
                // loop item

                $( '.block-col-inner .fame-block-item', c ).each( function( item_index ){
                    items_data[ item_index ] =  $( this ).prop( 'builder_data' );
                    var item_content = $( this ).prop( 'builder_content' ) || '';
                    if ( item_content ) {
                        item_html += '<div class="builder-item">' + item_content + '</div>';
                    }
                } );

                column_data.items = items_data;
                save_data[ row_index ].columns[ column_index ] = column_data;


                content += '<div class="builder-col col-md-'+column_data.settings._builder_col+' col-sm-12">';
                content += item_html;
                content += '</div>'; // end col
            });

            content += '</div>'; // end row
            content += '</div>'; // end container

        } );

        $( '.fame_builder_content', body ).val( JSON.stringify( save_data ) );


        try {
            var editor = window.tinymce.get( 'content');
            if ( editor ) {
                editor.setContent( content, {format : 'raw'});
            } else {
                $( '#content', body ).val( content );
            }

        } catch ( e ) {
            $( '#content', body ).val( content );
        }


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
        var c = confirm( FAME_BUILDER.texts.confirm_remove );
        if ( c ) {
            $( this ).closest( '.fame-block-row ' ).remove();
            update_data();
        }

    } );


    /**
     *  Input fields -----------------------------------------------
     */

    fame_editing_media = false;

    /**
     * Single medial handle
     */
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

    frame.on( 'select', function () {
        // Grab our attachment selection and construct a JSON representation of the model.
        var media_attachment = frame.state().get('selection').first().toJSON();

        var preview, img_url;
        img_url = media_attachment.url;
        if ( fame_editing_media ) {
            var p = fame_editing_media.closest('.fame-media');
            p.addClass( 'added' );

            $('.fame-attachment-id', p ).val( media_attachment.id );
            $('.fame-attachment-url', p ).val( img_url );


            if ( media_attachment.type == 'image' ) {
                fame_editing_media.css('background-image', 'url("' + img_url + '")');
                $( '.fame-attachment-type', p ).val( '' );
            } else if (media_attachment.type == 'video') {
                preview = '<video width="400" muted controls>' +
                    '<source src="' + img_url + '" type="' + media_attachment.mime + '">' +
                    'Your browser does not support HTML5 video.' +
                    '</video>';
                fame_editing_media.css('background-image', '');
                fame_editing_media.html(preview);
                $( '.fame-attachment-type', p ).val( media_attachment.mime );
            }
        }
        fame_editing_media.addClass( 'has-preview' );
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
        p.find( '.fame-media-preview' ).removeClass( 'has-preview' ).css( 'background-image', '' ).html( '' );
        $( '.fame-attachment-id', p  ).val( '' );
        $( '.fame-attachment-url', p ).val( '' );
        $( '.fame-attachment-type', p ).val( '' );
    } );


    /**
     * Gallery handle
     */
    var fame_gallery = function( options ){

        var settings = $.extend( {}, {
            shortcode: '',
            open_callback: function(){

            },
            update_callback: function(){

            },
            close_callback: function(){

            }
        }, options );

        // http://shibashake.com/wordpress-theme/how-to-add-the-wordpress-3-5-media-manager-interface-part-2
        var get_selection = function(){

            var shortcode = wp.shortcode.next( 'gallery', settings.shortcode ),
                defaultPostId = wp.media.gallery.defaults.id,
                attachments, selection;

            // Bail if we didn't match the shortcode or all of the content.
            if ( ! shortcode )
                return false;

            // Ignore the rest of the match object.
            shortcode = shortcode.shortcode;

            if ( _.isUndefined( shortcode.get('id') ) && ! _.isUndefined( defaultPostId ) )
                shortcode.set( 'id', defaultPostId );

            attachments = wp.media.gallery.attachments( shortcode );
            selection = new wp.media.model.Selection( attachments.models, {
                props:    attachments.props.toJSON(),
                multiple: true
            });

            selection.gallery = attachments.gallery;

            // Fetch the query's attachments, and then break ties from the
            // query to allow for sorting.
            selection.more().done( function() {
                // Break ties with the query.
                selection.props.set({ query: false });
                selection.unmirror();
                selection.props.unset('orderby');
            });

            return selection;
        };

        var selection = get_selection();
        var state = 'gallery-library';
        if ( state ) {
            state= 'gallery-edit';
        }

        var gallery = wp.media({
            id:         'fame-builder-gallery-frame',
            frame:      'post',
            state:      state,
            title:      wp.media.view.l10n.editGalleryTitle,
            editing:    true,
            multiple:   true,
            selection:  selection
        });

        gallery.on( 'open', function( selection ){
            settings.open_callback( gallery, selection );
        });

        gallery.on( 'close', function( selection ){
            settings.close_callback( gallery, selection );
        });

        gallery.on( 'update', function( selection ){
            var  _g = wp.media.gallery;
            var shortcode = _g.shortcode( selection );
            var items = selection.toJSON();
            var preview = '';
            var config = shortcode.attrs.named || {};
            if ( ! config.columns ) {
                config.columns = 3;
            }
            items.forEach( function ( item , index ){
                // console.log( item );
                var img_url;
                if( typeof ( item.sizes.thumbnail ) !== 'undefined' ){
                    img_url = item.sizes.thumbnail.url;
                }else{
                    img_url = item.url;
                }
                items[ index ] = {
                    id:  item.id,
                    thumb: img_url
                };

                preview += '<div class="gallery-item"><img src="'+img_url+'" alt=""/></div>';

            } );
            var data = {
                shortcode: shortcode.string(),
                config: config,
                items: items,
            };
            console.log( shortcode );
            settings.update_callback( gallery, selection, data );

        } );

        gallery.open();
    };


    body.on( 'click', '.fame-item-gallery', function( e ){
        e.preventDefault();

        var editing_gallery =  $( this );

        var value = $( '.fame-gallery-val', editing_gallery ).val();
        var shortcode = '';
        try {
            value = JSON.parse( value );
        } catch ( e ){
            value =  false;
        }

        if (  value && value.shortcode ) {
            shortcode = value.shortcode;
        }


        fame_gallery( {
            shortcode: value.shortcode,
            update_callback: function(  gallery, selection, data ){
                var preview = '';
                _.each( data.items, function( item ) {
                    preview += '<div><img src="'+item.thumb+'" alt=""/></div>';
                } );

                $( '.fame-gallery-val', editing_gallery ).val( JSON.stringify( data ) );
                $( '.fame-gallery-preview', editing_gallery ).html( preview );
                if ( preview !== '' ) {
                    $( '.fame-gallery-preview', editing_gallery ).addClass( 'has-preview' ).attr( '' );
                } else {
                    $( '.fame-gallery-preview', editing_gallery ).removeClass( 'has-preview' );
                }

            }
        } );

        gallery.open();

    } );


    function input_fields( $context ){
        $( '.color-picker', $context ).wpColorPicker();
        $( '.editor', $context ).wp_js_editor();
    }

    /**
     * EN Input fields -----------------------------------------------
     */
    function set_modal_size( modal, width, height ){
        var set_pos = function( ){
            var w = $( window ).width();
            var h = $( window ).height();
            // var cl = $( '#wpcontent' ).offset().left;
            var mw = width;
            var mh = height;
            if ( typeof mw === "undefined" || ! mw ) {
                mw = 800;
            }

            if ( typeof mh === "undefined" || ! mh ) {
                mh = 600;
            }

            if (  mw > w ) {
                mw = w - 20;
            }
            if (  mh > h - 100 ) {
                mh = h - 100;
            }
            var ml = ( w - mw ) / 2;
            var mt = ( h - mh ) / 2;
            modal.css( { left: ml , width: mw,  height: mh, top: mt } );
        };

        set_pos( );
        $( window ).resize( function(){
            set_pos(  );
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

    // Remove Modal
    $( document).on( 'keydown', function(e ) {
        if ( e.which === 27 ) {
            remove_modal();
        }
    } );

    // Item settings modal
    body.on( 'click', '.fame-block-item .fame-item-settings', function( e){
        e.preventDefault();
        fame_editing_item = $( this ).closest( '.fame-block-item' );
        var save_value = fame_editing_item.prop( 'builder_data' );

        if ( save_value._builder_id == 'gallery' ) {
            if ( typeof save_value.gallery === "undefined" ) {
                save_value.gallery = {};
            }

            if ( typeof save_value.gallery.shortcode === "undefined" ) {
                save_value.gallery.shortcode = '';
            }

            fame_gallery( {
                shortcode:  save_value.gallery.shortcode,
                update_callback: function ( gallery, section, data ) {
                    save_value.gallery = data;
                    if ( ! data.shortcode ) {
                        data.shortcode = '';
                    }
                    fame_editing_item.prop( 'builder_data', save_value );
                    fame_editing_item.prop( 'builder_content', data.shortcode );
                    update_data();
                    body.trigger( 'builder_data_setting_update', [ fame_editing_item, save_value, true ] );
                }
            } );

        } else {
            var config = get_item_by_id( save_value._builder_id );
            var d = setup_fields_data( config.fields, save_value );
            open_modal( config, d );
        }

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


    /**
     *  // Some key must convert to object
     * @param data
     * @param fields
     */
    function maybe_to_object( data, fields ){
        if ( $.isEmptyObject( fields ) ) {
            return data;
        }

        $.each( fields, function ( key, field ) {

            if ( typeof data[ field.id ] !== "undefined" &&  field.type == 'gallery'  ) {
                try {
                    data[ field.id ] = JSON.parse( data[ field.id ] );
                } catch ( e ) {
                    data[ field.id ] = {};
                }
            }
        } );

        return data;
    }

    // Modal Save Row/Column/Item save
    body.on( 'click', '.fame-builder-save', function ( e ){
        e.preventDefault();
        var old_data =  fame_editing_item.prop( 'builder_data' );
        var new_data = $( 'form.fame-modal-body-inner', body ).serializeObject();
        new_data = $.extend( {}, old_data, new_data );
        var config;

        switch ( new_data._builder_type ) {
            case 'row':
                new_data = maybe_to_object( new_data, FAME_BUILDER.row.fields );
                break;
            case 'column':
                new_data = maybe_to_object( new_data, FAME_BUILDER.col.fields );
                break;
            case 'item':
                config = get_item_by_id( new_data._builder_id );
                new_data =  maybe_to_object( new_data, config.fields );
                var _filter_update = itemControlMethod( new_data, 'update' );
                if ( _filter_update ) {
                    new_data = _filter_update( new_data, config, fame_editing_item );
                }
                break;
        }

        fame_editing_item.prop( 'builder_data', new_data );

        remove_modal();
        body.trigger( 'builder_data_setting_update', [ fame_editing_item, new_data ] );
    } );

    // Event handle when data change
    body.on( 'builder_data_setting_update', function( e, item, data, rendered_content ) {
        data = $.extend( {}, {
            id: '',
            _builder_type: '',
            _builder_id:   '',
        }, data );

        switch ( data._builder_type ) {
            case 'row': // when row settings changed
                if ( typeof data.columns !== "undefined" ) {
                    var n = string_to_number( data.columns );
                    var bd = $( '.fame-block-body', item );
                    var nc = $( '.fame-block-col', bd ).length;
                    var c =  Math.round( FAME_BUILDER.max_columns / n );
                    bd.attr( 'data-columns', n );
                    // Update column class
                    $( '.fame-block-col', bd ).attr( 'data-col', c );
                    $( '.fame-block-col', bd ).each( function(){
                        var data = $( this ).prop( 'builder_data' );
                        data._builder_col = c;
                        $( this ).prop( 'builder_data', data );
                    } );

                    var i ;
                    if ( n > nc ) { // add new column
                        for ( i = 0; i < n - nc; i ++ ) {
                            var tpl_c = new_column_object( { _builder_col: c, } );
                            bd.append( tpl_c );
                        }
                    } else  if ( nc > n ) { // remove columns
                        // before remove columns
                        // Move existing items columns that remove
                        var j = nc - 2;
                        var backup_items = [];
                        if (  j < 0 ) {
                            j = 0;
                        }
                        // copy items form removing columns
                        for ( i = nc - 1; i > n - 1; i -- ) {
                            $( '.fame-block-col', bd ).eq( i ).find( '.fame-block-item' ).each( function(){
                                var item = $( this ).clone();
                                item.prop( 'builder_data', $( this ).prop( 'builder_data' ) );
                                backup_items.push( item );
                            } );
                        }
                        $.each( backup_items, function( index, child ) {
                            $( '.fame-block-col .block-col-inner', bd ).eq( j ).append( child );
                        } );

                        // Remove column
                        for ( i = nc - 1; i > n - 1; i -- ) {
                            $( '.fame-block-col', bd ).eq( i ).remove();
                        }

                        update_data();
                    }
                }
                break;
            case 'item':
                // Update preview
                var config = get_item_by_id( data._builder_id );
                if ( typeof config.content_template !== "undefined" ){
                    var preview = '';

                    var _filter_preview = itemControlMethod( data, 'preview' );
                    if ( _filter_preview ) {
                        data = _filter_preview( data, config, item );
                    }

                    preview = render_template_by_html( config.content_template, data );
                    $( '.fame-item-preview', item ).html( preview );


                    var content = $( '.fame-item-preview', item ).html();
                    if ( content && content.trim() !== '' ) {
                        item.addClass( 'has-preview' );
                    } else {
                        item.removeClass( 'has-preview' );
                    }


                    if ( typeof rendered_content === "undefined" || ! rendered_content ) {
                        if (data._builder_id === 'gallery') {
                            try {
                                item.prop('builder_content', data.gallery.shortcode );
                            } catch (e) {
                                item.prop('builder_content', '');
                            }
                        } else {
                            item.prop('builder_content', preview);
                        }
                    }


                }
                break;

        } // end switch

        // Update data
        update_data();

    } );


    // Open modal add new item
    fame_new_item_modal = get_template( 'fame-builder-add-items-tpl', {} );
    fame_new_item_modal = $( fame_new_item_modal );
    fame_new_item_modal.hide();
    body.append( fame_new_item_modal );
    set_modal_size( fame_new_item_modal );

    // Defined templates
    fame_defined_templates = get_template( 'fame-builder-templates-tpl', FAME_BUILDER.defined_templates );
    fame_defined_templates = $( fame_defined_templates );
    fame_defined_templates.hide();
    body.append( fame_defined_templates );
    set_modal_size( fame_defined_templates );
    body.on( 'click', '.fame-import-btn', function( e ){
        e.preventDefault();
        body.append( '<div class="fame-modal-drop"></div>' );
        fame_defined_templates.show();
        set_modal_size( fame_defined_templates, 900, 550 );
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
        var item = get_template( 'fame-builder-item-tpl', config );
        item = $( item );
        // Update preview
        if ( typeof config.content_template !== "undefined" ){
            var preview = render_template_by_html( config.content_template, save_values );
            $( '.fame-item-preview', item ).html( preview );

            var content = $( '.fame-item-preview', item ).html();
            if ( content && content.trim() !== '' ) {
                item.addClass( 'has-preview' );
            } else {
                item.removeClass( 'has-preview' );
            }

            if ( save_values._builder_id === 'gallery' ) {
                try {
                    item.prop( 'builder_content',  save_values.gallery.shortcode );
                } catch ( e ) {
                    item.prop( 'builder_content',  '' );
                }
            } else {
                item.prop( 'builder_content',  preview );
            }

        }

        item.prop( 'builder_data', save_values );
        return item;
    }

    // Add new column
    function new_column_object( settings ){
        settings = $.extend( {}, {
            _builder_type: 'column',
            _builder_title: '',
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
            _builder_title: '',
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

        var num_col = string_to_number( data.settings.columns );
        if ( num_col <= 0 ) {
            num_col = FAME_BUILDER.default_row_col;
        }

        data.settings.columns = num_col;

        var r = new_row_object( data.settings );

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

    // Open modal to add item
    body.on( 'click', '.fame-block-col .fame-add', function( e ){
        e.preventDefault();
        $( 'body' ).append( '<div class="fame-modal-drop"></div>' );
        var col = $( this ).closest( '.fame-block-col' );
        fame_selected_item = col;
        fame_new_item_modal.show();
    } );


    // Add item
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
                    var new_item = new_item_object( data );
                    $( '.block-col-inner', fame_selected_item ).append( new_item );
                    fame_editing_item = new_item;
                    var save_value = fame_editing_item.prop('builder_data');

                    if ( string_to_bool( FAME_BUILDER.open_setting_when_new ) ) {

                        if ( save_value._builder_id === 'gallery'  ) {

                            if ( typeof save_value.gallery === "undefined") {
                                save_value.gallery = {};
                            }

                            if (typeof save_value.gallery.shortcode === "undefined") {
                                save_value.gallery.shortcode = '';
                            }

                            fame_gallery({
                                shortcode: save_value.gallery.shortcode,
                                update_callback: function (gallery, section, data) {
                                    save_value.gallery = data;
                                    if (!data.shortcode) {
                                        data.shortcode = '';
                                    }
                                    fame_editing_item.prop('builder_data', save_value);
                                    fame_editing_item.prop('builder_content', data.shortcode );
                                    update_data();
                                    body.trigger('builder_data_setting_update', [fame_editing_item, save_value, true]);
                                }
                            });
                        } else {
                            var d = setup_fields_data(item_config.fields, save_value);
                            open_modal(item_config, d);
                        }

                    }

                }
            }
        }

        update_data();
    } );

    // Remove Item
    body.on( 'click', '.fame-block-item .fame-item-remove', function( e ) {
        e.preventDefault();
        var c = confirm( FAME_BUILDER.texts.confirm_remove );
        if ( c ) {
            $( this ).closest( '.fame-block-item' ).remove();
            update_data();
        }
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



    // Load import template
    body.on( 'click', '.fame-list-templates .tpl-item', function( e ){
        e.preventDefault();
        var id = $( this ).attr( 'data-id' ) || '';
        if ( id && typeof FAME_BUILDER.defined_templates[ id ] !== "undefined" ) {
            remove_modal();
            var data = JSON.parse( FAME_BUILDER.defined_templates[ id ].data );

            $.each( data, function( index, row ){
                var r = add_row_object( row );
                $( '.fame-builder-area', body ).append( r );
            } );

            update_data();

        }
    } );


    // When page load
    // check content
    body.on( 'fame_editor_changed', function(){
        var post_content = $( '#content' ).val();
        var data = $( '.fame_builder_content', body ).val();

        var r, c;
        try {
            data = JSON.parse( data );
        } catch ( e ) {
            data = {};
        }

        if ( post_content && $.isEmptyObject( data ) ) {

            var row_data =  {
                _builder_type: 'row',
                _builder_title: '',
                columns: 1,
                title: '',
                id: '',
            };
            var col_data = {
                _builder_type: 'column',
                _builder_title: '',
                _builder_col: 12,
            };
            var item_data = {
                _builder_type: 'item',
                _builder_id:   'text',
                text: post_content
            };

            r = new_row_object( row_data );
            r.prop( 'builder_data', row_data );
            c = new_column_object( col_data );
            $( '.fame-builder-area', body ).html( r );
            $( '.fame-block-body', r ).html( c );
            $( '.block-col-inner', c ).html(  new_item_object( item_data ) );
        }
    } );
    body.trigger( 'fame_editor_changed' );

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



   // $( '.fame-add' ).eq( 0 ).trigger( 'click' );


} );