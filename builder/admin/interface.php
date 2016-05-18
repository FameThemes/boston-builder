<div class="fame-builder hide" style="display: none">
    <div class="fame-builder-toolbar">
        <div class="fame-builder-btn new-item" title="Add item">
            <span class="dashicons dashicons-plus"></span>
        </div>
        <div class="fame-builder-btn" title="Templates">
            <span class="dashicons dashicons-admin-page"></span>
        </div>
    </div>
    <div class="fame-builder-area">


        <div class="fame-block-row">
            <div class="fame-block-header">
               <div class="fame-block-heading">Row <span class="fame-block-name"></span></div>
               <div class="block-toolbar fame-toolbar">
                   <div class="fame-row-settings fame-settings"></div>
                   <div class="fame-row-remove fame-remove"></div>
               </div>
            </div>
            <div class="fame-block-body-wrap">
                <div class="fame-block-body" data-columns="3">

                    <div class="fame-block-col">
                        <div class="fame-col-toolbar fame-toolbar">
                            <div class="fame-col-move fame-move"></div>
                            <div class="fame-col-settings fame-settings"></div>
                            <div class="fame-col-remove fame-remove"></div>
                        </div>
                        <div class="block-col-inner">
                            <div class="fame-block-item">item 1
                                <div class="fame-item-toolbar fame-toolbar">
                                    <div class="fame-item-move fame-move"></div>
                                    <div class="fame-item-settings fame-settings"></div>
                                    <div class="fame-item-remove fame-remove"></div>
                                </div>
                            </div>
                            <div class="fame-block-item">item 2</div>
                            <div class="fame-block-item">item 3</div>
                        </div>
                    </div>

                    <div class="fame-block-col">
                        <div class="fame-col-toolbar fame-toolbar">
                            <div class="fame-col-move fame-move"></div>
                            <div class="fame-col-settings fame-settings"></div>
                            <div class="fame-col-remove fame-remove"></div>
                        </div>
                        <div class="block-col-inner">
                            <div class="fame-block-item">item 5</div>
                            <div class="fame-block-item">item 6</div>
                            <div class="fame-block-item">item 7</div>
                        </div>
                    </div>

                    <div class="fame-block-col">
                        <div class="fame-col-toolbar fame-toolbar">
                            <div class="fame-col-move fame-move"></div>
                            <div class="fame-col-settings fame-settings"></div>
                            <div class="fame-col-remove fame-remove"></div>
                        </div>
                        <div class="block-col-inner">
                            <div class="fame-block-item">item 8</div>
                            <div class="fame-block-item">item 9</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>


        <div class="fame-block-row">
            <div class="fame-block-header">
                <div class="fame-block-heading">Row <span class="fame-block-name"></span></div>
                <div class="block-toolbar fame-toolbar">
                    <div class="fame-row-settings fame-settings"></div>
                    <div class="fame-row-remove fame-remove"></div>
                </div>
            </div>
            <div class="fame-block-body-wrap">
                <div class="fame-block-body" data-columns="3">

                    <div class="fame-block-col">
                        <div class="fame-col-toolbar fame-toolbar">
                            <div class="fame-col-move fame-move"></div>
                            <div class="fame-col-settings fame-settings"></div>
                            <div class="fame-col-remove fame-remove"></div>
                        </div>
                        <div class="block-col-inner">
                            <div class="fame-block-item">item 10</div>
                        </div>
                    </div>

                    <div class="fame-block-col">
                        <div class="fame-col-toolbar fame-toolbar">
                            <div class="fame-col-move fame-move"></div>
                            <div class="fame-col-settings fame-settings"></div>
                            <div class="fame-col-remove fame-remove"></div>
                        </div>
                        <div class="block-col-inner">
                            <div class="fame-block-item">item 11</div>
                        </div>
                    </div>

                    <div class="fame-block-col">
                        <div class="fame-col-toolbar fame-toolbar">
                            <div class="fame-col-move fame-move"></div>
                            <div class="fame-col-settings fame-settings"></div>
                            <div class="fame-col-remove fame-remove"></div>
                        </div>
                        <div class="block-col-inner">
                            <div class="fame-block-item">item 12</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>


    </div><!-- fame-builder-area -->
</div>







<script type="text/html" id="fame-builder-modal-tpl">
    <div class="fame-modal">
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


<script type="text/html" id="fame-row-settings-tpl">

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
                case 'media':  #>
                    <label>
                        <span>{{ item.title }}</span>
                    </label>
                    <div class="fame-media">
                        <div class="fame-media-preview"></div>
                        <div class="fame-media-remove"></div>
                        <input name="{{ item.id }}[id]" class="fame-attachment-id" type="hidden">
                        <input name="{{ item.id }}[url]" class="fame-attachment-url" type="hidden">
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
                    <textarea name="{{ item.id }}"  class="fame-input editor">{{ item.value }}</textarea>
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