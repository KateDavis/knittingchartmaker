
kcm.Chart = function(cols, rows, yarn) {
    this._cols = cols;
    this._rows = rows;
    this._yarn = ( yarn ? yarn : new kcm.Yarn("Yarn 1", "#FFFFFF") );
    this._chart = [];

    this._build_chart = function() {
        this._chart = [];
        for (var r=0; r<this._rows; ++r) {
            this._chart[r] = [];
            for (var c=0; c<this._cols; ++c) {
                this._chart[r].push(new kcm.knit(this._yarn));
            }
        }
    };
    this._build_chart();

    this.cols = function(new_cols) {
        if (new_cols) {
            this._cols = new_cols;
        }
        return this._cols;
    };
    this.rows = function(new_rows) {
        if (new_rows) {
            this._rows = new_rows;
        }
        return this._rows;
    };
    this.yarn = function(col, row, new_yarn) {
        if (new_yarn) {
            this._chart[row][col].yarn(this.add_yarn(new_yarn));
        }
        return this._chart[row][col].yarn;
    };
    this.stitch = function(col, row, new_stitch) {
        /* TODO: don't think need these checks as ChartGrid::_cell_click_handler checks this */

        if (new_stitch) {
            /* if plain part of multi-col stitch, remove that stitch */
            /* if replacing a multi-col stitch, replace null its stitches */
            if (this._chart[row][col] instanceof kcm.Stitch) {
                for (var i=col-1; i >= 0; --i) {
                    this._chart[row][i] = new kcm.knit(this._yarn);
                    if (! this._chart[row][i] instanceof kcm.Stitch) {
                        break;
                    }
                }
            } else if (this._chart[row][col]) {
                for (var i=1; i<this._chart[row][col].cols(); ++i) {
                    this._chart[row][col+i] = new kcm.knit(this._yarn);
                }
            }

            this._chart[row][col] = new_stitch;

            /* if multi-col stitch then clear those stitch it overlaps */
            for (var i=1; i<new_stitch.cols(); ++i) {
                if (this._chart[row][col+i]) {
                    /* if replacing a multi-col stitch, clear it */
                    if (this._chart[row][col+i]) {
                        for (var j=1; j<this._chart[row][col+i].cols(); ++j) {
                            if (this._chart[row][col+i+j]) {
                                this._chart[row][col+i+j] = new kcm.knit(this._yarn);
                            }
                        }
                    }

                    this._chart[row][col+i] = new kcm.BlankStitch(new_stitch.yarn());
                }
            }
        }
        return this._chart[row][col];
    };

    this.resize = function(cols, rows) {
        var new_chart = [];
        for (var r=0; r<rows; ++r) {
            new_chart[r] = [];
            for (var c=0; c<cols; ++c) {
                if (this._chart[r] && this._chart[r][c]) {
                    new_chart[r][c] = this._chart[r][c];
                } else {
                    new_chart[r].push(new kcm.knit(this._yarn));
                }
            }
        }

        this.cols(cols);
        this.rows(rows);
        this._chart = new_chart;
    };

    this.to_svg = function(sqw, sqh, bg_col) {
        var tw = this._cols * sqw;
        var th = this._rows * sqh;
        var svg_xml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (tw+1) + '" height="' + (th+1) + '">\n';

        /* draw background and border */
        svg_xml += '<rect x="0" y="0" width="' + (tw+1) + '" height="' + (th+1) + '" fill="' + bg_col + '" stroke="#000000" stroke-width="1"/>\n';

        // add vertical lines
        for (var i=0; i <= tw; i += sqw) {
            svg_xml += '<path d="M'+i+',0 L'+i+','+th+'" fill="none" stroke="#000000" stroke-width="1"/>\n';
        }

        // add horizontal lines
        for (var i=0; i <= th; i += sqh) {
            svg_xml += '<path d="M0,'+i+' L'+tw+','+i+'" fill="none" stroke="#000000" stroke-width="1"/>\n';
        }

        /* draw stitches */
        for (var r=0; r<this._rows; ++r) {
            for (var c=0; c<this._cols; ++c) {
                svg_xml += this._chart[r][c].to_svg((c*sqw)+1, (r*sqh)+1, sqw-1, sqh-1);
            }
        }

        svg_xml += '</svg>';
        return svg_xml;
    };
};
