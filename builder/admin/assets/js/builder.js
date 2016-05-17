/**
 * Created by truongsa on 5/17/16.
 */

( function( $ ){

    // Loaf view style
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

    $( '.fame-builder' ).removeAttr( 'style' ).removeClass( 'hide' );

} )( jQuery );