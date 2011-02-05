
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
    this.colour = function(new_colour)
    {
        if (new_colour)
        {
            this._colour = new_colour;
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
        return "#BBBBBB";
    };
};
