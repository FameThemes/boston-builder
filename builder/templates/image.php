<?php
$args['image'] = wp_parse_args( $args['image'], array(
    'url' => '',
    'id' => '',
) );

$src = wp_get_attachment_image_src( $args['image']['id'], $args['size'] );

?>
<div class="fame-image">
    <img src="<?php echo esc_url( $args['image']['url'] ); ?>" alt="">
</div>