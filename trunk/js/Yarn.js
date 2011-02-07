
kcm.Yarn = function(name, colour)
{
    this._name = name;
    this._colour = colour;

    this.name = function(new_name)
    {
        if (new_name)
        {
            this._name = new_name;
        }
        return this._name;
    };
    /* colour should be hex value without the preceding '#' */
    this.colour = function(new_colour)
    {
        if (new_colour && new_colour != this._colour)
        {
            if (new_colour.match(/[0-9A-Fa-f]/) && ( new_colour.length == 6 || new_colour.length == 3) ) { 
                this._colour = new_colour;
                this._selection_colour = null;
            } else {
                throw("Invalid Colour '"+new_colour+"'. Colour should be 3 or 6 digit hex.");
            }
        }
        return this._colour;
    };
    this.data = function()
    {
        return {
            name:   this._name,
            colour: this._colour
        };
    };
    this.selected_colour = function()
    {
        if (this._selection_colour) {
            return this._selection_colour;
        }

        /* extremes */
        if (this._colour == 'FFFFFF') {
            this._selection_colour = 'DDDDDD';
        } else if (this._colour == '000000') {
            this._selection_colour = '222222';
        } else {

           /*
             * only works for hex colours, taken from:
             * http://stackoverflow.com/questions/1787124/programmatically-darken-a-hex-colour/1787193#1787193
             */
            var r, g, b;
            if (this._colour.length == 6) {
                r = this._colour.substr(1,2);
                g = this._colour.substr(3,2);
                b = this._colour.substr(5,2);
            } else if (this._colour.length == 3) {
                r = this._colour.substr(1,1);
                g = this._colour.substr(2,1);
                b = this._colour.substr(3,1);

                /* convert to two char format */
                r += r;
                g += g;
                b += b;
            }

            if (r && g && b) {
                this._selection_colour = ( ( "0x"+r+g+b & 0xfefffe ) >> 1 ).toString(16);

                /* sometimes above will come back with < 6 values, so pad with 0 */
                while (this._selection_colour.length < 6) {
                    this._selection_colour = "0" + this._selection_colour;
                }
                return this._selection_colour;
            }
        }

        /* if in doubt, return light grey */
        if (!this._selection_colour) {
            this._selection_colour = "DDDDDD";
        }

        return this._selection_colour;
    };
};
