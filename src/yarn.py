
import logging

import gtk.gdk

class Yarn:
    seldelta = 5000

    def __init__(self, label, col="#FFFFFF"):
        logging.debug("new yarn with label \"%s\" and col %s" % (label, col))
        self.label = label
        self.col = None
        self.gtkcol = None
        self.selectioncol = None
        self.setCol(col) 
        self.gc = None
        
    def setCol(self, col):
        logging.debug("set yarn \"%s\" col from %s to %s" % (self.label, self.col, col))
        self.col = col
        self.gtkcol = gtk.gdk.color_parse(col)
        self.setSelectionCol(self.gtkcol)
        
    def setGtkCol(self, gtkcol):
        logging.debug("set yarn \"%s\" gtkcol from %s to %s" % (self.label, self.gtkcol.to_string(), gtkcol.to_string()))
        self.gtkcol = gtkcol
        self.col = "#%2s%2s%2s" % (hex(gtkcol.red / 256)[2:], hex(gtkcol.green / 256)[2:], hex(gtkcol.blue / 256)[2:])
        self.col = self.col.replace(" ", "0")
        logging.debug("gtkcol %s parsed as %s" % (self.gtkcol.to_string(), self.col))

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
    
        logging.debug("set yarn \"%s\" selection col using %s to %s " % (self.label, gtkcol.to_string(), col.to_string()))
        self.selectioncol = col
