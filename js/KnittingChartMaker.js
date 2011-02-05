
kcm.KnittingChartMaker = function(canvas_id, chart_options_id) {
    this._chart_grid = new kcm.ChartGrid(canvas_id, 10, 10);
    this._chart_options = document.getElementById(chart_options_id);

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
        this._chart_options.innerHTML = "";

        /* chart size options */
        var input_cols = document.createElement("input");
        input_cols.id = "kcm_chart_cols";
        input_cols.size = 4;
        input_cols.value = this._chart_grid.cols();
        var input_rows = document.createElement("input");
        input_rows.id = "kcm_chart_rows";
        input_rows.value = this._chart_grid.rows();
        input_rows.size = 4;
        var resize_button = document.createElement("button");
        resize_button.appendChild(document.createTextNode("Resize"));
        var label_size = document.createElement("label");
        label_size.appendChild(document.createTextNode("Chart Size: "));
        this._chart_options.appendChild(label_size);
        this._chart_options.appendChild(input_cols);
        this._chart_options.appendChild(document.createTextNode("x"));
        this._chart_options.appendChild(input_rows);
        this._chart_options.appendChild(resize_button);

        resize_button.onclick = function(event) {
            self._chart_grid.resize(input_cols.value, input_rows.value);
            self.draw();
        };

        /* stitch choice */
        var stitch_choice = document.createElement("select");
        stitch_choice.id = "kcm_stitch_choice";
        var stitch_size = document.createElement("input");
        stitch_size.id = "kcm_stitch_size";
        stitch_size.size = 3;
        stitch_size.disabled = true;
        var stitches = [
            "knit", "purl", "k2tog", "k3tog", "sk2p", "sl1", "yo", "m1", "ssk",
            "ck3dec", "fc", "bc"
        ];
        for (var i=0; i<stitches.length; ++i) {
            var option = document.createElement("option");
            option.appendChild(document.createTextNode(stitches[i]));
            stitch_choice.appendChild(option);
        }
        stitch_choice.onchange = function(event) {
            var new_stitch = stitch_choice.options[stitch_choice.selectedIndex].value;
            self._chart_grid.current_stitch(new_stitch);

            /* check if stitch is variable */
            if ((new kcm[new_stitch]()).variable_width()) {
                stitch_size.disabled = false;
            } else {
                stitch_size.value = '';
                stitch_size.disabled = true;
            }
        };
        stitch_size.onchange = function(event) {
            var new_size = parseInt(stitch_size.value);
            self._chart_grid.current_stitch_width(new_size);
        };

        var label_stitch_choice = document.createElement("label");
        label_stitch_choice.appendChild(document.createTextNode("Stitch: "));
        this._chart_options.appendChild(label_stitch_choice);
        this._chart_options.appendChild(stitch_choice);
        this._chart_options.appendChild(stitch_size);

        /* yarn choice */
        var current_yarn = this._chart_grid.current_yarn().name();
        var yarn_choice = document.createElement("select");
        yarn_choice.id = "kcm_yarn_choice";
        for (var yarn_name in this._chart_grid._yarns) {
            var option = document.createElement("option");
            option.appendChild(document.createTextNode(yarn_name));
            option.style.backgroundColor = this._chart_grid._yarns[yarn_name].colour();
            if (current_yarn == yarn_name) {
                option.selected = true;
            }
            yarn_choice.appendChild(option);
        }
        var new_yarn_option = document.createElement("option");
        new_yarn_option.appendChild(document.createTextNode("-- New Yarn --"));
        yarn_choice.appendChild(new_yarn_option);
        yarn_choice.onchange = function(event) {
            var yarn_name = yarn_choice.options[yarn_choice.selectedIndex].value;

            var add_new_yarn = false;
            if (yarn_name == "-- New Yarn --") {
                yarn_name = "Yarn " +  ++self._chart_grid._yarn_count;
                add_new_yarn = true;
            }

            var new_yarn = self._chart_grid.current_yarn(yarn_name, (add_new_yarn ? "#FF0000" : null));

            /* set colour for user to change */
            yarn_colour.value = yarn_colour.style.background = new_yarn.colour(); 

            if (add_new_yarn) {
                var option = document.createElement("option");
                option.appendChild(document.createTextNode(yarn_name));
                option.style.backgroundColor = new_yarn.colour();
                option.selected = true;
                yarn_choice.insertBefore(option, new_yarn_option);
            }
        };

        var yarn_colour = document.createElement("input");
        yarn_colour.onkeyup = function(event) {
            var yarn_option = yarn_choice.options[yarn_choice.selectedIndex];
            var yarn_name = yarn_option.value;
            var selected_yarn = self._chart_grid.current_yarn(yarn_name);
            var new_colour = yarn_colour.value;

            /* re-colour the choices */
            yarn_option.style.background = yarn_colour.style.background = "";
            yarn_option.style.background = yarn_colour.style.background = new_colour;

            /* set new colour on yarn and redraw grid */
            selected_yarn.colour(new_colour);
            self.draw();
        };

        var label_yarn_choice = document.createElement("label");
        label_yarn_choice.appendChild(document.createTextNode("Yarn: "));
        this._chart_options.appendChild(label_yarn_choice);
        this._chart_options.appendChild(yarn_choice);
        this._chart_options.appendChild(yarn_colour);
        yarn_choice.onchange();

        /* save button */
        var save_button = document.createElement("button");
        save_button.id = "kcm_chart_save";
        save_button.appendChild(document.createTextNode("Save"));
        save_button.onclick = function(event) {
            var canvas_data = self._chart_grid.data();
            window.open("data:application/json;charset=utf-8,"+encodeURI(canvas_data), "_newtab");
        };
        this._chart_options.appendChild(save_button);

        /* load button */
        var load_button = document.createElement("button");
        load_button.id = "kcm_chart_load";
        load_button.appendChild(document.createTextNode("Load"));
        load_button.onclick = function(event) {
            var canvas_data = window.prompt("Paste previously saved data:");
            self._chart_grid.data(canvas_data);

            /* set select stitch and yarn */
            self._setup_options();
            for (var i=0; i<self._stitch_choice.options.length; ++i) {
                if (self._stitch_choice.options[i].value == self._chart_grid.current_stitch) {
                    self._stitch_choice.options[i].select = true;
                    break;
                }
            }
        };
        this._chart_options.appendChild(load_button);

        /* as image PNG */
        var image_png_button = document.createElement("button");
        image_png_button.id = "kcm_chart_image_png";
        image_png_button.appendChild(document.createTextNode("Image (PNG)"));
        image_png_button.onclick = function(event) {
            var image_data = self._chart_grid.image_data();
            window.open(image_data, "_newtab");
        };
        this._chart_options.appendChild(image_png_button);

        /* as image SVG */
        var image_svg_button = document.createElement("button");
        image_svg_button.id = "kcm_chart_image_svg";
        image_svg_button.appendChild(document.createTextNode("Image (SVG)"));
        image_svg_button.onclick = function(event) {
            var svg_xml = self._chart_grid.to_svg(
                self._chart_grid.square_width(),
                self._chart_grid.square_height(),
                self._chart_grid.colour("background")
            );
            window.open("data:image/svg+xml;charset=utf-8," + encodeURI(svg_xml), "_newtab");
        };
        this._chart_options.appendChild(image_svg_button);
    };

    this.draw = function() {
        this._chart_grid.draw();
    };

    /* when all is setup, build options and draw the grid */
    this._setup_options();
    this.draw();
};
