/*
 * Combines a kcm.Chart object which stores a knitting chart
 * with a kcm.Grid grid object which displays a grid.
 * There result being a Chart displayed as a Grid.
 */
kcm.ChartGrid = function(canvas_id, cols, rows) {

    /* setup from chart and grid objects */
    kcm.Chart.call(this, cols, rows);
    kcm.Grid.call(this, canvas_id, cols, rows);

    this._default_stitch = this._current_stitch = "knit";
    this._default_yarn   = this._current_yarn   = this._yarn;
    this._yarns = {};
    this._yarns[this._yarn.name()] = this._current_yarn;
    this._yarn_count = 1;
    this._selection = {};

    /* add cell draw handler */
    this._cell_draw_handler = function(context, c, r, x, y, w, h) {
        var stitch = this.stitch(c, r);
        if (stitch && c+stitch.cols() <= this.cols()) {
            stitch.draw(context, c, r, x, y, w, h);
        }
    };
    this.handler('cell_draw', this._cell_draw_handler);

    /* add click handler to adjust stitches */
    this._cell_click_handler = function(c, r, double_click) {
        var original_stitch = this.stitch(c, r);

        var new_stitch;
        if (double_click) {
            new_stitch = new kcm[this._default_stitch](this._default_yarn, this._current_stitch_width);
        } else {
            new_stitch = new kcm[this._current_stitch](this._current_yarn, this._current_stitch_width);
        }

        /* check that new stitch fits */
        if (c + new_stitch.cols() > this.cols()) {
            return;
        }

        /* don't do multi-stitch selection filling just yet */
        if (this._selection[c+","+r] && new_stitch.cols() > 1 ){
            return;
        }

        if (this._selection[c+","+r]) {
            for (var pos in this._selection) {
                pos = pos.split(',');
                this.stitch(pos[0], pos[1], new_stitch);
            }
        } else{
            this.stitch(c, r, new_stitch);
        }
        this.draw();
    };
    this.handler('cell_click', this._cell_click_handler);

    /* add handler to capture selections */
    this._cell_selected_handler = function(c, r) {
        if (!this._selection[c+","+r]) {
            console.log('selecting '+c+','+r);
            var stitch = this.stitch(c, r);
            stitch.selected(true);
            this._selection[c+","+r] = stitch;
            this.draw();
        }
    };
    this.handler('cell_selected', this._cell_selected_handler);
    this._cell_unselected_handler = function(c, r) {
        if (this._selection[c+","+r]) {
            console.log('unselecting '+c+','+r);
            var stitch = this.stitch(c, r);
            stitch.selected(false);
            delete this._selection[c+","+r];
            this.draw();
        }
    };
    this.handler('cell_unselected', this._cell_unselected_handler);

    this.current_stitch = function(new_stitch) {
        if (new_stitch) {
            this._current_stitch = new_stitch;
        }
        return this._current_stitch;
    };
    this.current_stitch_width = function(new_stitch_width) {
        if (new_stitch_width) {
            this._current_stitch_width = new_stitch_width;
        }
        return this._current_stitch_width;
    };
    this.current_yarn = function(new_yarn_name, new_colour) {
        if (new_yarn_name) {
            if (!this._yarns[new_yarn_name]) {
                this._yarns[new_yarn_name] = new kcm.Yarn(new_yarn_name, new_colour);
            }
            this._current_yarn = this._yarns[new_yarn_name];
        }
        return this._current_yarn;
    };
    this.data = function(data) {
        if (data) {
            var chart_grid_data = JSON.parse(data);
            this._rows = chart_grid_data.rows;
            this._cols = chart_grid_data.cols;
            this._square_width = chart_grid_data.square_width;
            this._square_height = chart_grid_data.square_height;
            this._total_width = chart_grid_data.total_width;
            this._total_height = chart_grid_data.total_height;
            this._colours = chart_grid_data.colours;
            this._calculate_total_width();

            this._yarns = {};
            this._yarn_count = chart_grid_data.yarn_count;
            for (var i=0; i<chart_grid_data.yarns.length; ++i) {
                var yarn_data = chart_grid_data.yarns[i];
                this.current_yarn(yarn_data.name, yarn_data.colour);
            }

            this._default_stitch = chart_grid_data.default_stitch;
            this._default_yarn = this.current_yarn(chart_grid_data.default_yarn);
            this.current_stitch(chart_grid_data.current_stitch);

            this._chart = [];
            for (var r=0; r<chart_grid_data.chart.length; ++r) {
                this._chart[r] = [];
                for (var c=0; c<chart_grid_data.chart[r].length; ++c) {
                    var stitch = new kcm[chart_grid_data.chart[r][c].name](
                        this.current_yarn(chart_grid_data.chart[r][c].yarn)
                    );
                    stitch.rows(chart_grid_data.chart[r][c].rows);
                    stitch.cols(chart_grid_data.chart[r][c].cols);
                    this._chart[r].push(stitch);
                }
            }

            this.current_yarn(chart_grid_data.current_yarn);
            this.draw();
        } else {
            var chart_grid_data = {
                "default_stitch": this._default_stitch,
                "default_yarn": this._default_yarn.name(),
                "current_stitch": this._current_stitch,
                "current_yarn": this._current_yarn.name(),
                "yarn_count": this._yarn_count,
                "yarns": [],
                "rows": this._rows,
                "cols": this._cols,
                "square_width": this._square_width,
                "square_height":this._square_height,
                "total_width": this._total_width,
                "total_height": this._total_height,
                "colours": this._colours ,
                "chart": []
            };

            for (var yarn_name in this._yarns) {
                var yarn = this._yarns[yarn_name];
                chart_grid_data.yarns.push(yarn.data());
            }

            for (var r=0; r<this._chart.length; ++r) {
                var data_row = [];
                for (var c=0; c<this._chart[r].length; ++c) {
                    data_row.push({
                        "name": this._chart[r][c].name(),
                        "yarn": this._chart[r][c].yarn().name(),
                        "rows": this._chart[r][c].rows(),
                        "cols": this._chart[r][c].cols()
                    });
                }
                chart_grid_data.chart.push(data_row);
            }

            return JSON.stringify(chart_grid_data, null, 2);
        }
    };
};
