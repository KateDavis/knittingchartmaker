
import gtk.gdk

class Yarn:
    seldelta = 5000

    def __init__(self, label, col="#FFFFFF"):
        self.label = label
        self.col = None

        self.gtkcol = None
        self.selectioncol = None
        self.setCol(col) 
        self.gc = None
        
    def setCol(self, col):
        self.col = col
        self.gtkcol = gtk.gdk.color_parse(col)
        self.setSelectionCol(self.gtkcol)
        
    def setGtkCol(self, gtkcol):
        self.gtkcol = gtkcol
        self.col = "#%2s%2s%2s" % (hex(gtkcol.red / 256)[2:], hex(gtkcol.green / 256)[2:], hex(gtkcol.blue / 256)[2:])
        self.col = self.col.replace(" ", "0")
        self.setSelectionCol(self.gtkcol)
    
    def setSelectionCol(self, gtkcol):
        r = gtkcol.red - self.seldelta
        if r <= 0:
            r += self.seldelta * 2
            
        g = gtkcol.green - self.seldelta
        if g <= 0:
            g += self.seldelta * 2
            
        b = gtkcol.blue - self.seldelta
        if b <= 0:
            b += self.seldelta * 2
        
        col = gtk.gdk.Color(r, g, b)
    
        self.selectioncol = col
    
    def __str__(self):
        return self.name
