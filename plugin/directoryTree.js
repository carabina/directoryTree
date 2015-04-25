// directoryTree jQuery Plugin
// For displaying an array of filepaths as a browsable directory list.
// version 1.0, May 24th, 2014
// The MIT License (MIT)
// Copyright (c) 2015 Sam Scott (http://samzscott.com)
// Tested with jQuery v2.1.3


(function($) {
    // Input is the (unique) ID of the containing element and pathArray is an array of directory entry objects 
    // usage example: "$('#element').directoryTree(["/folder1", "/folder1/folder2", "/folder1/folder2/image.jpg"]);"
    $.directoryTree = function(containerID, pathArray) {

        //--------------- Initialization ---------------
        // the current instance of the object
        var plugin = this;

        // CSS classes/behavior paramaters
        var containerClassname = "directoryTree";
        var radioButtonClassname = 'directorytreeradio';
        var rootRadioButtonClassname = 'rootradio';
        var firstLevelULClassname = 'firstlevel-ul';
        var childULClassname = 'child-ul';
        var hasChildrenClassname = 'has-children';
        var noChildrenClassname = 'no-children';
        var slideSpeed = 150;

        var pathData = {};

        var defaults = {
            paths : []
        }

        // access plugin.settings via:
        // "plugin.settings.propertyName" from inside the plugin
        // "element.data('directoryTree').settings.propertyName" from outside the plugin (where "element" is the element the plugin is attached to)
        plugin.settings = {}

        var container = $(containerID);

        plugin.init = function() {
            container.addClass(containerClassname);
            plugin.reloadData(pathArray);
            $(document).on('click', '#'+ container.attr('id') +' ul li > span', function(e) {
                var node = $(e.target).parent();
                node.children('ul').slideToggle(slideSpeed);
                e.stopImmediatePropagation();
            });
            $(document).on('change', '.'+radioButtonClassname, function() {
                $('.'+radioButtonClassname).not(this).prop('checked', false);
            });
        }


        //--------------- Public Methods ---------------
        // element.data('directoryTree').publicMethod(arg1, arg2, ... argn) from outside the plugin (where "element" is the element the plugin is attached to)

        plugin.reloadData = function(pathArray) {
            //load a new directory tree
            plugin.settings.paths = $.merge([], pathArray);
            pathData = {};
            var dataptr = pathData;
            $.map(pathArray, function( path, i) {
                addpath(path, dataptr);
            });
            container.html(genTemplateStart(pathData));
            plugin.collapseAll();
            $('.'+firstLevelULClassname).slideToggle(slideSpeed);
            $('.'+rootRadioButtonClassname).prop('checked', true);
        }

        plugin.selectedJSON = function() {
            return $('.'+radioButtonClassname+':checked').val();
        }

        plugin.expandAll = function () {
            container.find('li.'+hasChildrenClassname+' > ul').each(function() {
                $(this).slideDown(slideSpeed);
            });
        }

        plugin.collapseAll = function () {
            container.find('li.'+hasChildrenClassname+' > ul').each(function() {
                $(this).slideUp(slideSpeed);
            });
        }

        //--------------- Private Methods ---------------

        var addpath = function(path,ptr){
          var splitpath = path.replace(/^\/|\/$/g, "").split('/');
          for (i=0;i<splitpath.length;i++)
          {
            node = {name: splitpath[i], path: '/'+splitpath.slice(0,i+1).join("/")};
            ptr[splitpath[i]] = ptr[splitpath[i]]||node;
            ptr[splitpath[i]].children=ptr[splitpath[i]].children||{};
            ptr=ptr[splitpath[i]].children;
          }
        }

        var genTemplate = function(dirPaths,level){
            var tempstr = '<ul class="'+((level == 1) ? firstLevelULClassname : childULClassname)+'">';
            $.each(dirPaths, function(index, parent) {
                tempstr += '<li class="'+(!$.isEmptyObject(parent.children) ? hasChildrenClassname : noChildrenClassname) +'">';
                tempstr += '<span><input type="radio" class="'+radioButtonClassname+'" value="'+parent.path+'"> '+parent.name +'</span>';
                if (!$.isEmptyObject(parent.children)) {
                    tempstr += genTemplate(parent.children, level+1);
                }
                tempstr += '</li>';
            });
            tempstr += '</ul>';
            return tempstr;
        }

        var genTemplateStart = function(dirPaths){
            return '<ul class="root-ul"><li class="'+hasChildrenClassname+'"><span><input type="radio" class="'+radioButtonClassname+' '+rootRadioButtonClassname+'" value="/"> /</span>' + genTemplate(dirPaths,1) + '</li></ul>';
        }

        plugin.init();
    }

    // add the plugin to the jQuery.fn object
    $.fn.directoryTree = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('directoryTree')) {
                var plugin = new $.directoryTree(this, options);
                $(this).data('directoryTree', plugin);
            }
        });
    }
})(jQuery);