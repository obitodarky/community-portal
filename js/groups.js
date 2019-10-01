jQuery(function(){
    Dropzone.autoDiscover = false;
    
    jQuery("#group-photo-uploader").dropzone({
        url: '/wp-admin/admin-ajax.php?action=upload_group_image',
        acceptedFiles: 'image/*',
        maxFiles: 1,
        createImageThumbnails: false,
        addRemoveLinks: true,
        init: function() {
            this.on("sending", function(file, xhr, formData){
                var nonce = jQuery('#my_nonce_field').val();
                formData.append('my_nonce_field', nonce);
            });
        },
        success: function (file, response) {
        
            file.previewElement.classList.add("dz-success");
            file['attachment_id'] = response; // push the id for future reference
            
            jQuery('#image-url').val(response);
            jQuery('.dz-image').css('background-image', 'url(' +  response + ')');

            jQuery('.create-group__image-upload').removeClass('create-group__image-upload--uploading');
            jQuery('.create-group__image-upload').addClass('create-group__image-upload--done');
            jQuery('.create-group__image-instructions').addClass('create-group__image-instructions--hide');
        },
        error: function (file, response) {
            file.previewElement.classList.add("dz-error");
        },
        sending: function(file, xhr, formData) {
            jQuery('.create-group__image-upload').removeClass('create-group__image-upload--done');
            jQuery('.create-group__image-upload').addClass('create-group__image-upload--uploading');
        },
        removedfile: function(file) {
            jQuery('.create-group__image-upload').removeClass('create-group__image-upload--done');   
            jQuery('.create-group__image-instructions--hide').removeClass('create-group__image-instructions--hide');
            return (_ref = file.previewElement) != null ? _ref.parentNode.removeChild(file.previewElement) : void 0;     
        }
    });

    jQuery('.create-group__input, .create-group__textarea, .create-group__select').on('change keyup paste', function(e){
        var $this = jQuery(this);
        if($this.val() != '' || $this.val() == '0') {
            $this.removeClass('create-group__input--error');
            $this.next('.form__error-container').removeClass('form__error-container--visible');
        } else {
            $this.addClass('create-group__input--error');
            $this.next('.form__error-container').addClass('form__error-container--visible');
        }
        e.stopPropagation();

        return false;
    });

    jQuery('.create-group__tag').click(function(e) {
        e.preventDefault();
        var $this = jQuery(this);
        var tag = $this.data('value');
        var current = jQuery('#tags').val();

        if(!$this.hasClass('create-group__tag--active'))
            jQuery('#tags').val(current + ',' + tag);
        
        if($this.hasClass('create-group__tag--active'))
            jQuery('#tags').val(current.replace(',' + tag, ''));

        $this.toggleClass('create-group__tag--active');

        return false;
    });



    jQuery('#create-group-form').one('submit', function(e){
        e.preventDefault();
        var error = false;
        jQuery(':input[required]').each(function(index, element){
            var $ele = jQuery(element);
            var $errorMsg = $ele.next('.form__error-container');

            if($ele.val() == "" || $ele.val() == "0" || ($ele.is(':checkbox') && $ele.prop("checked") === false)) {
                error = true;

                if($ele.is(':checkbox')) {
                    var checkboxes = $ele.siblings('.create-group__check');
                    if(checkboxes.length === 1) {
                        jQuery(checkboxes[0]).addClass('create-group__check--error');
                    }
                } else {
                    $ele.addClass("create-group__input--error");
                }
                $errorMsg.addClass('form__error-container--visible');
            }
        });

        if(error) {
            jQuery('#create-group-form').find('.create-group__input--error:first').focus();
            return false;
        } else {
    
            jQuery(this).submit();
            return true;
        }
        
    });


    jQuery('input[name="group_type"]').change(function(e){
        var $this = $(this);

        var countryLabel = $('label[for="group-country"]').text();
        var cityLabel = $('label[for="group-city"]').text();

        if($this.val() == 'Offline') {
            jQuery('select[name="group_country"]').prop('required', true);
            jQuery('label[for="group-country"]').text(countryLabel.replace('*', ''));
            jQuery('input[name="group_city"]').prop('required', true);
            jQuery('label[for="group-city"]').text(cityLabel.replace('*', ''));
        } else {
            jQuery('select[name="group_country"]').prop('required', false);
            jQuery('label[for="group-country"]').text(countryLabel.concat(' *'));
            jQuery('input[name="group_city"]').prop('required', false);
            jQuery('label[for="group-city"]').text(cityLabel.concat(' *'));
        }

    });

    jQuery('.group__join-cta').click(function(e) {
        e.preventDefault();
        var $this = jQuery(this);
        var group = $this.data('group');
        var post = { 
            'group': group
        };

        var url = $this.text() == 'Join Group' ? '/wp-admin/admin-ajax.php?action=join_group' : '/wp-admin/admin-ajax.php?action=leave_group'

        jQuery.ajax({
            url: url,
            data: post,
            method: 'POST',
            success: function(response) {
                response = jQuery.parseJSON(response);

                if(response.status == 'success') {
                    var memberCount = parseInt(jQuery('.group__member-count').text());
                    if($this.text() == 'Join Group') {
                        memberCount++;
                        $this.text('Leave Group');
                    } else {
                        memberCount--;
                        $this.text('Join Group');
                    }     

                    jQuery('.group__member-count').text(memberCount);
                }
            }
        });


        return false;
    });



    jQuery('#group-admin').autoComplete({
        source: function(term, suggest) {
            jQuery.getJSON('/wp-admin/admin-ajax.php?action=get_users', { q: term }, function(data){
                var users = [];

                for(var x = 0; x < data.length; x++) {
                    users.push(data[x].data.user_login + ":" + data[x].data.ID);
                }
                suggest(users);
            });
        },
        renderItem: function(item, search) {
            search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            console.log(item);


            var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
            return '<div class="autocomplete-suggestion" data-val="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
        }

    });
    

});