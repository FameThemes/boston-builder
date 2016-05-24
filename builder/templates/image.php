<?php
/**
 * Created by PhpStorm.
 * User: truongsa
 * Date: 5/24/16
 * Time: 18:46
 */

$args['image'] = wp_parse_args( $args['image'], array(
    'url' => '',
    'id' => '',
) );

$src = wp_get_attachment_image_src( $args['image']['id'], $args['size'] );

?>
<img src="<?php echo esc_url( $args['image']['url'] ); ?>" alt="">
