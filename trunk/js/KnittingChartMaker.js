
function $(id) {
    return document.getElementById(id);
}

kcm.KnittingChartMaker = function(
        canvas_id,  width_id,       height_id,  resize_id,
        stitch_id,  stitch_size_id, yarn_id,    yarn_colour_id,
        save_id,    load_id,        img_png_id, img_svg_id
) {
    this._chart_grid = new kcm.ChartGrid(canvas_id, 10, 10);

    /* check for any URL config options */
    var vars = [];
    var params = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < params.length; i++)
    {
        var values = params[i].split('=');
        vars[values[0]] = values[1];
    }
    if (vars.stitch_width) {
        this._chart_grid._square_width = parseInt(vars.stitch_width);
        this._chart_grid._calculate_total_width();
    }
    if (vars.stitch_height) {
        this._chart_grid._square_height = parseInt(vars.stitch_height);
        this._chart_grid._calculate_total_width();
    }

    /* keep object in scope */
    var self = this;

    /* setup chart options */
    this._setup_options = function() {

        /* chart size options */
        $(resize_id).onclick = function(event) {
            self._chart_grid.resize($(width_id).value, $(height_id).value);
            self.draw();
        };

        /* stitch choice */
        var stitches = [
            "knit", "purl", "k2tog", "k3tog", "sk2p", "sl1", "yo", "m1", "ssk",
            "ck3dec", "fc", "bc"
        ];
        for (var i=0; i<stitches.length; ++i) {
            var option = document.createElement("option");
            option.appendChild(document.createTextNode(stitches[i]));
            $(stitch_id).appendChild(option);
        }
        $(stitch_id).onchange = function(event) {
            var new_stitch = $(stitch_id).options[$(stitch_id).selectedIndex].value;
            self._chart_grid.current_stitch(new_stitch);

            /* check if stitch is variable */
            if ((new kcm[new_stitch]()).variable_width()) {
                $(stitch_size_id).disabled = false;
            } else {
                $(stitch_size_id).value = '';
                $(stitch_size_id).disabled = true;
            }
        };
        $(stitch_size_id).onchange = function(event) {
            var new_size = parseInt($(stitch_size_id).value);
            self._chart_grid.current_stitch_width(new_size);
        };

        /* yarn choice */
        var current_yarn = this._chart_grid.current_yarn().name();
        for (var yarn_name in this._chart_grid._yarns) {
            var option = document.createElement("option");
            option.appendChild(document.createTextNode(yarn_name));
            option.style.backgroundColor = this._chart_grid._yarns[yarn_name].colour();
            if (current_yarn == yarn_name) {
                option.selected = true;
            }
            $(yarn_id).appendChild(option);
        }
        var new_yarn_option = document.createElement("option");
        new_yarn_option.appendChild(document.createTextNode("-- New Yarn --"));
        $(yarn_id).appendChild(new_yarn_option);
        $(yarn_id).onchange = function(event) {
            var yarn_name = $(yarn_id).options[$(yarn_id).selectedIndex].value;

            var add_new_yarn = false;
            if (yarn_name == "-- New Yarn --") {
                yarn_name = "Yarn " +  ++self._chart_grid._yarn_count;
                add_new_yarn = true;
            }

            var new_yarn = self._chart_grid.current_yarn(yarn_name, (add_new_yarn ? "FF0000" : null));

            /* set colour for user to change */
            $(yarn_colour_id).value = $(yarn_colour_id).style.background = new_yarn.colour(); 

            if (add_new_yarn) {
                var option = document.createElement("option");
                option.appendChild(document.createTextNode(yarn_name));
                option.style.backgroundColor = new_yarn.colour();
                option.selected = true;
                $(yarn_id).insertBefore(option, new_yarn_option);
            }
        };

        $(yarn_colour_id).onchange = function(event) {
            var yarn_option = $(yarn_id).options[$(yarn_id).selectedIndex];
            var yarn_name = yarn_option.value;
            var selected_yarn = self._chart_grid.current_yarn(yarn_name);
            var new_colour = $(yarn_colour_id).value;

            /* re-colour the choices */
            yarn_option.style.background = yarn_colour.style.background = "";
            yarn_option.style.background = yarn_colour.style.background = new_colour;

            /* set new colour on yarn and redraw grid */
            selected_yarn.colour(new_colour);
            self.draw();
        };
        $(yarn_colour_id).className = "color"; /* set class to use jscolor for nice color chooser */

        $(yarn_id).onchange();

        /* save button */
        $(save_id).onclick = function(event) {
            var canvas_data = self._chart_grid.data();
            window.open("data:application/json;charset=utf-8,"+encodeURI(canvas_data), "_newtab");
        };

        /* load button */
        $(load_id).onclick = function(event) {
            var canvas_data = window.prompt("Paste previously saved data:");
            self._chart_grid.data(canvas_data);

            /* set select stitch and yarn */
            self._setup_options();
            for (var i=0; i<$(stitch_id).options.length; ++i) {
                if ($(stitch_id).options[i].value == self._chart_grid.current_stitch) {
                    $(stitch_id).options[i].select = true;
                    break;
                }
            }
        };

        /* as image PNG */
        $(img_png_id).onclick = function(event) {
            var image_data = self._chart_grid.image_data();
            window.open(image_data, "_newtab");
        };

        /* as image SVG */
        $(img_svg_id).onclick = function(event) {
            var svg_xml = self._chart_grid.to_svg(
                self._chart_grid.square_width(),
                self._chart_grid.square_height(),
                self._chart_grid.colour("background")
            );
            window.open("data:image/svg+xml;charset=utf-8," + encodeURI(svg_xml), "_newtab");
        };
    };

    this.draw = function() {
        this._chart_grid.draw();
    };

    /* when all is setup, build options and draw the grid */
    this._setup_options();
    this.draw();
};
