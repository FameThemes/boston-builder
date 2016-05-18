/**
 * Created by truongsa on 5/17/16.
 */

( function( $ ){

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





    $( ".fame-builder-area" ).sortable({
        //tolerance: "pointer",
        handle: '.fame-block-header',
        zIndex: 99999,
    });

    function update_row() {
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

    $( ".fame-block-body" ).sortable({
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
        start: function( event, ui ) {
            update_row();
        },
        sort: function( event, ui ) {
            update_row();
        },
        stop: function( event, ui ) {
            update_row();
        }
    });


    $( ".block-col-inner" ).sortable({
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
        start: function( event, ui ) {
            update_row();
        },
        sort: function( event, ui ) {
            update_row();
        },
        stop: function( event, ui ) {
            update_row();
        }
    });


    // Test
    $( 'body' ).on( 'click', '.new-item', function(e ){
        e.preventDefault();
        var r = $( '.fame-block-row' ).eq( 0 ).clone();
        $( '.fame-builder-area ' ).append( r );

        $( ".fame-block-body" ,r ).sortable({
            handle: '.fame-col-move',
            placeholder: 'fame-block-col fame-placeholder',
            forcePlaceholderSizeType: true,
            forceHelperSize: true,
            refreshPositions: true,
            distance: 2,
            tolerance: 'pointer',
            zIndex: 99999,
            //helper: "clone",
            //connectWith: ".fame-block-body",
            start: function( event, ui ) {
                update_row();
            },
            sort: function( event, ui ) {
                update_row();
            },
            stop: function( event, ui ) {
                update_row();
            }
        });

        $( ".block-col-inner", r ).sortable({
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
            start: function( event, ui ) {
                update_row();
            },
            sort: function( event, ui ) {
                update_row();
            },
            stop: function( event, ui ) {
                update_row();
            }
        });

    } );


} )( jQuery );