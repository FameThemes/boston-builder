
<div class="fame-builder-switch">
    <button class="fame-builder-switch-btn button button-secondary">Switch to builder</button>
</div>

<div class="fame-builder-wrap">
    <div class="fame-builder hide" style="display: none">
        <div class="fame-builder-toolbar">
            <div class="fame-builder-btn new-row" title="Add Rơ">
                <?php _e( 'New row', 'textdomain' ); ?>
            </div>
            <div class="fame-builder-btn fame-import-btn" title="<?php esc_attr( 'Import', 'textdomain' ) ?>">
                <span class="dashicons dashicons-admin-page"></span>
            </div>
        </div>
        <div class="fame-builder-area">

        </div><!-- fame-builder-area -->
        <input type="hidden" autocomplete="off" class="fame_builder_content" name="fame_builder_content" value="<?php echo esc_attr( json_encode( Fame_Builder::get_builder_content() ) ); ?>">
    </div>
</div>

<input type="hidden" autocomplete="off" id="fame_post_content_type" name="fame_post_content_type" value="<?php echo esc_attr( Fame_Builder::get_content_type() ); ?>">


<script type="text/html" id="fame-builder-row-tpl">
    <?php $row_config = Fame_Builder::get_row_config(); ?>
    <div class="fame-block-row">
        <div class="fame-block-header">
            <div class="fame-block-heading"><?php echo esc_html( $row_config['title'] ); ?><span class="fame-block-name"></span></div>
            <div class="block-toolbar fame-toolbar">
                <div class="fame-row-settings fame-settings"></div>
                <div class="fame-row-remove fame-remove"></div>
            </div>
        </div>
        <div class="fame-block-body-wrap">
            <div class="fame-block-body" data-columns="1">

            </div>
        </div>
    </div>
</script>

<script type="text/html" id="fame-builder-col-tpl">
    <?php // $col_config = Fame_Builder::get_col_config(); ?>
    <div class="fame-block-col">
        <div class="fame-col-toolbar fame-toolbar">
            <div class="fame-col-l fame-arrow-left"></div>
            <div class="fame-col-r fame-arrow-right"></div>
            <div class="fame-col-settings fame-settings"></div>
            <div class="fame-col-add fame-add"></div>
        </div>

        <div class="block-col-inner"></div>
    </div>
</script>

<script type="text/html" id="fame-builder-item-tpl">
    <div data-id="{{ data.id }}" class="fame-block-item">
        <div class="fame-item-toolbar fame-toolbar">
            <div class="fame-item-move fame-move"></div>
            <div class="fame-item-settings fame-edit"></div>
            <div class="fame-item-remove fame-remove"></div>
        </div>

        <div class="fame-item-settings fame-item-icon"  <# if ( data.icon_type == 'url' ) { #> style="background-image: url( '{{ data.icon }}' );" <# } #> >
            <# if ( data.icon_type != 'url' ) { #>
                <span class="fame-add-icon {{ data.icon }}"></span>
            <# } #>
        </div>

        <# if ( data.preview ) {  #>
        <div class="fame-item-preview"></div>
        <# } #>
    </div>
</script>


<script type="text/html" id="fame-builder-modal-tpl">
    <div class="fame-modal fame-item-modal">
        <div class="fame-modal-inner">
            <div class="fame-modal-header"><span class="modal-heading">{{ data.title }}</span> <div class="fame-modal-remove"></div></div>
            <div class="fame-modal-body">
                <form action="#" class="fame-modal-body-inner">
                    {{{ data.html }}}
                </form>
            </div>
            <div class="fame-modal-footer">
                <button class="fame-builder-save button button-primary button-large"><?php _e( 'Save', 'textdomain' ); ?></button>
            </div>
        </div>
    </div>
</script>


<script type="text/html" id="fame-builder-add-items-tpl">

    <div class="fame-modal fame-no-footer">
        <div class="fame-modal-inner">
            <div class="fame-modal-header"><span class="modal-heading"><?php esc_html_e( 'Add new item', 'textdomain' ); ?></span> <div class="fame-modal-remove"></div></div>
            <div class="fame-modal-body">
                <div class="fame-modal-body-inner">

                    <div class="fame-builder-items">
                        <?php
                        $items = Fame_Builder::get_items_config();
                        foreach ( $items as $id => $item ) {

                            $style = '';
                            if ( $item['icon_type'] == 'url' ) {
                                $style = ' style="background-image: url(\''.esc_url( $item['icon'] ).'\');" ';
                            }

                            ?>
                            <div class="fame-add-item" data-id="<?php echo esc_attr( $item['id'] ) ?>">
                                <div class="fame-add-item-inner">
                                    <div class="fame-add-thumb"<?php echo $style; ?>>
                                        <?php
                                        if ( $item['icon_type'] != 'url' ) { ?>
                                            <span class="fame-add-icon <?php echo esc_attr( $item['icon'] ); ?>"></span>
                                        <?php } ?>
                                    </div>
                                    <div class="fame-add-name"><?php echo esc_html( $item['title'] ); ?></div>
                                </div>
                            </div>
                            <?php
                        }
                        ?>
                    </div>

                </div>
            </div>
        </div>
    </div>
</script>


<script type="text/html" id="fame-builder-templates-tpl">

    <div class="fame-modal fame-page-templates fame-no-footer">
        <div class="fame-modal-inner">
            <div class="fame-modal-header"><span class="modal-heading"><?php esc_html_e( 'Import', 'textdomain' ); ?></span> <div class="fame-modal-remove"></div></div>
            <div class="fame-modal-body">
                <div class="fame-modal-body-inner">
                    <p class="description"><?php _e( 'Select a template to import', 'textdomain' ); ?></p>
                    <div class="fame-list-templates">
                        <#
                        _.each( data, function( item, id ){

                            #>
                            <div class="tpl-item" data-id="{{ item.id }}">
                                <div class="tpl-item-id">{{ item.id }}</div>
                                <div class="tpl-item-name">{{ item.title }}</div>
                                <div class="tpl-item-add"></div>
                            </div>
                        <#
                        });
                        #>
                    </div>

                </div>
            </div>
        </div>
    </div>
</script>



<script type="text/html" id="fame-builder-fields-tpl">
    <# for ( i in data ) {
        var item = data[ i ];
        #>
        <div data-key="{{ item.id }}" class="fame-modal-item type-{{ item.type }}">
            <# switch( item.type ) {

                case 'color':  #>
                    <label>
                        <span>{{ item.title }}</span>
                        <input name="{{ item.id }}" class="color-picker" value="{{ item.value }}" type="text">
                    </label>
                <#
                    break;
                case 'media':
                    var values;
                    if ( typeof( item.value ) !== "object" ) {
                        values = {};
                    } else {
                        values = item.value;
                    }

                    #>
                    <label>
                        <span>{{ item.title }}</span>
                    </label>
                    <div class="fame-media">
                        <div class="fame-media-preview <# if ( values.url ) { #> has-preview <# } #>"
                        <# if ( values.type == ''  && values.url ) { #>
                            style="background-image: url('{{ values.url }}');"
                        <# } #>
                        >
                            <# if ( values.type != '' && values.url ) { #>
                                <video width="400" muted controls>
                                    <source src="{{ values.url }}" type="{{ values.type }}">
                                    <?php esc_html_e( 'Your browser does not support HTML5 video.', 'textdomain' ); ?>
                                </video>
                            <# } #>
                        </div>

                        <div class="fame-media-remove"></div>
                        <input name="{{ item.id }}[id]" class="fame-attachment-id" type="hidden">
                        <input name="{{ item.id }}[url]" class="fame-attachment-url" type="hidden">
                        <input name="{{ item.id }}[type]" class="fame-attachment-type" type="hidden">
                    </div>
                <#
                    break;
                    case 'checkbox':  #>
                    <label>
                        <span>{{ item.title }}</span>
                        <input name="{{ item.id }}" class="fame-input" <# if ( item.value == 1 || item.value == "1" ) { #> selected="selected" <# } #> value="1" type="checkbox">
                    </label>
                <#
                    break;
                    case 'select':  #>
                    <label>
                        <span>{{ item.title }}</span>
                        <select name="{{ item.id }}" class="fame-input" >
                            <# _.map( item.options, function( value, key ){ #>
                                <option <# if ( item.value == key ) { #> selected="selected" <# } #> value="{{ key }}">{{ value }}</option>
                            <#  } ); #>
                        </select>
                    </label>
                <#
                    break;
                    case 'textarea':  #>
                    <label>
                        <span>{{ item.title }}</span>
                    </label>
                    <textarea name="{{ item.id }}" class="fame-input">{{ item.value }}</textarea>
                <# break;
                    case 'editor':  #>
                    <label>
                        <span>{{ item.title }}</span>
                    </label>
                    <textarea name="{{ item.id }}" class="fame-input editor">{{ item.value }}</textarea>
                <# break;
                    default:  #>
                    <label>
                        <span>{{ item.title }}</span>
                        <input name="{{ item.id }}" class="fame-input" value="{{ item.value }}" type="text">
                    </label>
                <#
                    break;
                }
                #>

            <#  if ( item.desc ) {  #>
            <div class="fame-desc">{{{ item.desc }}}</div>
            <# } #>
        </div>
    <# }  #>
</script>