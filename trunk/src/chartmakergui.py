
import chart
import gtk
import stitch
import sys
import yarn


class ChartMakerGUI:
    def __init__(self, filename=None):
        self.title = 'ChartMaker'
        self.version = '0.5'
        self.website = "http://code.google.com/p/knittingchartmaker/"
        self.authors = ["Iain Kelly", "Joeli Kelly"]
        self.description = "A program for designing knitting charts."
        
        self.savefile = filename
        
        self.builderfile = 'glade/chartmakergui.xml'
        self.builder = gtk.Builder()
        self.builder.add_from_file(self.builderfile)
        self.widgets = {}
        
        # setup signals
        signals = {
            'on_main_window_delete_event'        : self.closedown,
            'on_new1_activate'                   : self.newChartDialog,
            'on_open1_activate'                  : self.openDialog,
            'on_save1_activate'                  : self.save,
            'on_save_as1_activate'               : self.saveAsDialog,
            'on_export1_activate'                : self.exportDialog,
            'on_resize1_activate'                : self.resizeDialog,
            'on_preferences1_activate'           : self.preferencesDialog,
            'on_about1_activate'                 : self.about,
            'on_yarn_combobox_changed'           : self.switchYarn,
            'on_edit_yarn_button_clicked'        : self.editYarnDialog,
            'on_stitch_combobox_changed'         : self.switchStitch,
            'on_stitch_ratio_entry_changed'      : self.setStitchRatio,
            'on_zoom_scale_value_changed'        : self.setZoom,
            'on_quit1_activate'                  : self.closedown
        }
        self.builder.connect_signals(signals)
        
        # setup chart
        self.chart = chart.DrawableChart(20, 20, yarn.Yarn("Background Colour", "#FFFFFF"))
        self.get_widget('chart_area').add(self.chart.drawing_area())
        self.chart.refresh()
        
        # add handlers for chart
        self.chart.connect("chart_changed", self.chartChanged)
        
        # setup preview (as single cell chart)
        self.stitch_preview = chart.DrawableChart(1, 1, self.chart.yarn, readOnly=True)
        self.get_widget('preview_box').add(self.stitch_preview.drawing_area())
        self.stitch_preview.refresh()
        
        # set zoom scale (can be on option at some point)
        zoom_adjustment = self.get_widget('zoom_scale').get_adjustment()
        zoom_adjustment.lower = 10
        zoom_adjustment.upper = 40
        
        # set ratio
        self.get_widget('stitch_ratio_entry').set_value(self.chart.h / self.chart.w)
        
        # set up some file filters
        self.file_filters = {}
        self.file_filters['svg'] = gtk.FileFilter()
        self.file_filters['svg'].add_pattern("*.svg")
        self.file_filters['svg'].set_name("SVG files (*.svg)")
        self.file_filters['cm'] = gtk.FileFilter()
        self.file_filters['cm'].add_pattern("*.cm")
        self.file_filters['cm'].set_name("ChartMaker files (*.cm)")
        
        # set filter on export
        self.get_widget('export_filechooser').add_filter(self.file_filters['svg'])
        
        # openDialog file is present
        if self.savefile is not None:
            self.openFile(filename)
        else:
            # setup default yarn/stitch list
            self.setYarnList()
            self.setStitchList()
        
        # rendered image settings
        self.img_sqw = 40
        self.img_sqh = 40
        self.img_sqspace = 1
        self.img_gridcol = gtk.gdk.color_parse('#ccc')
        self.img_bgcol = gtk.gdk.color_parse('#fff')
        self.img_numcol = gtk.gdk.color_parse('#000')
        
        # add a dirty flag for any changes
        self.dirty = False
        
        # set the title
        self.setTitle()
        
        # show the gui and start it all
        self.get_widget('main_window').show_all()
        gtk.main()
    
    def get_widget(self, widget):
        if not self.widgets.has_key(widget):
            builder_widget = self.builder.get_object(widget)
            if builder_widget:
                self.widgets[widget] = builder_widget
        return self.widgets[widget]
    
    def closedown(self, widget, event):
        if self.getUserConfirmation("Close?\nChanges maded to current Chart will be lost.", True):
            widget.destroy()
            gtk.main_quit()
        else:
            return True
        
    def setTitle(self):
        w = self.get_widget('main_window')
        title = self.title + ' v' + self.version
        if self.savefile is not None:
            title += ': ' + self.savefile.split('/')[-1]
        if self.chart.dirty or self.dirty:
            title += "*"
        w.set_title(title)
        
    def setStitchRatio(self, widget):
        self.chart.setStitchSize(self.chart.w, int(self.chart.w * float(widget.get_value())))
        self.chart.refresh()
        
    def setZoom(self, widget):
        self.chart.setStitchSize(int(widget.get_value()))
        self.chart.refresh()
        
    def setYarnList(self):
        # get combo box and clear it
        yarnsbox = self.get_widget('yarn_combobox')
        yarnsbox.set_model(None)
        yarnsbox.clear()
        
        # build new list
        yarnlist = gtk.ListStore(str)
        cell = gtk.CellRendererText()
        yarnsbox.pack_start(cell, True)
        yarnsbox.add_attribute(cell, 'text', 0)
        yarnlist.clear()
        for yn in self.chart.yarns:
            yarnlist.append([yn])
        yarnlist.append(["New Yarn..."])
        
        # set the new list
        yarnsbox.set_model(yarnlist)
        yarnsbox.set_active(0)
        
    def switchYarn(self, widget):
        active = widget.get_active()
        model = widget.get_model()
        if active == len(model) - 1:
            y = yarn.Yarn("Colour %d" % active, "#FF0000")
            self.chart.addYarn(yarn=y, switch=True)
            model.insert(active, [y.label])
            widget.set_active(active)
            self.refreshStitchPreview()
            self.dirty = True
            self.setTitle()
        else:
            if self.chart.yarn.label != model[active][0]:
                self.chart.addYarn(label=model[active][0], switch=True)
                self.refreshStitchPreview()
        
    def setStitchList(self):
        # get combo box and clear it
        stitchesbox = self.get_widget('stitch_combobox')
        stitchesbox.set_model(None)
        stitchesbox.clear()
        
        # build new list
        stitchlist = gtk.ListStore(str)
        cell = gtk.CellRendererText()
        stitchesbox.pack_start(cell, True)
        stitchesbox.add_attribute(cell, 'text', 0)
        stitchlist.clear()
        for st in stitch.allStitches():
            if st == self.chart.stitch.name:
                stitchlist.insert(0, [st])
            else:
                stitchlist.append([st])
        
        # set the new list
        stitchesbox.set_model(stitchlist)
        stitchesbox.set_active(0)
            
    def switchStitch(self, widget):
        active = widget.get_active()
        model = widget.get_model()
        self.chart.stitch = stitch.createStitch(model[active][0], self.chart.yarn)
        self.refreshStitchPreview()
        
    def refreshStitchPreview(self):
        self.stitch_preview.stitch = self.chart.stitch
        self.stitch_preview.yarn = self.chart.yarn
        self.stitch_preview.setStitch(0, 0, self.chart.stitch)
        self.stitch_preview.setYarn(0, 0, self.chart.yarn)
        self.stitch_preview.refresh()
        
    def editYarnDialog(self, widget=None):
        self.get_widget('yarn_label').set_text(self.chart.yarn.label)
        self.get_widget('yarn_col').set_current_color(self.chart.yarn.gtkcol)
        
        widget = self.get_widget('yarn_dialog')
        self.startBusy()
        widget.show_all()
        response = widget.run()
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_APPLY]:
            lbl = self.get_widget('yarn_label').get_text()
            self.chart.yarn.setGtkCol(self.get_widget('yarn_col').get_current_color())
            
            model = self.get_widget('yarn_combobox').get_model()
            for r in model:
                if r[0] == self.chart.yarn.label:
                    r[0] = lbl
                    self.chart.yarn.label = lbl
                    break
            
            # refresh chart and preview with new colors
            self.chart.refresh() 
            self.refreshStitchPreview()
            self.dirty = True
            self.setTitle()
            
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_CANCEL]:
            widget.hide()
        self.stopBusy()
            
    def preferencesDialog(self, widget):
        # TODO: set current vals
        widget = self.get_widget('preferences_dialog')
        widget.show_all()
        self.startBusy()
        response = widget.run()
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_APPLY]:
            new_grid_col = self.get_widget('chart_grid_col_entry').get_text()
            if new_grid_col:
                self.chart.setGridColour(new_grid_col)
            
            # TODO: set all values
            pass
        
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_CANCEL]:
            widget.hide()
            
        self.stopBusy()
        
    def newChartDialog(self, widget):
        if self.getUserConfirmation("Create new Chart?\nChanges maded to current Chart will be lost.", True):
            self.get_widget('newchart_width_entry').set_value(20)
            self.get_widget('newchart_height_entry').set_value(20)
            
            self.startBusy()
            widget = self.get_widget('newchart_dialog')
            widget.show_all()
            response = widget.run()
            if response == gtk.RESPONSE_OK:
                w = int(self.get_widget('newchart_width_entry').get_value())
                h = int(self.get_widget('newchart_height_entry').get_value())
                
                # create a new chart and add it to screen (removing old one)
                screen = self.get_widget('chart_area')
                screen.remove(self.chart.drawing_area())
                self.chart = chart.DrawableChart(w, h)
                screen.add(self.chart.drawing_area())
                screen.show_all()
                
                # reset options then redraw all
                self.savefile = None
                self.refreshStitchPreview()
                self.drawChart()
                self.dirty = False
                self.chart.dirty = False
                self.setTitle()
            
            widget.hide()
            
            self.stopBusy()
    
    def drawChart(self):
        self.startBusy()
        self.chart.refresh()
        self.stopBusy()
        
    def resizeDialog(self, widget):
        self.get_widget('resize_width_entry').set_value(self.chart.w)
        self.get_widget('resize_height_entry').set_value(self.chart.h)
        self.get_widget('resize_from_combo').set_active(0)
        
        widget = self.get_widget('resize_dialog')
        self.startBusy()
        widget.show_all()
        response = widget.run()
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_APPLY]:
            w = int(self.get_widget('resize_width_entry').get_value())
            h = int(self.get_widget('resize_height_entry').get_value())
            f = int(self.get_widget('resize_from_combo').get_active())
            self.chart.resize(w, h, f)
            self.drawChart()
        
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_CANCEL]:
            widget.hide()
        
        self.stopBusy()
    
    def openDialog(self, widget):
        if self.getUserConfirmation("Open new Chart?\nChanges maded to current Chart will be lost.", True):
            f = gtk.FileChooserDialog('Open...', self.get_widget('main_window'), gtk.FILE_CHOOSER_ACTION_OPEN, \
                                    (gtk.STOCK_CANCEL, gtk.RESPONSE_CANCEL, gtk.STOCK_OK, gtk.RESPONSE_OK))
            
            # add filter of .cm files
            f.add_filter(self.file_filters['cm'])
            
            response = f.run()
            if response == gtk.RESPONSE_OK:
                name = f.get_filename()
                if name is not None:
                    self.openFile(name)
                
            f.destroy()
    
    def openFile(self, filename):
        self.startBusy()
        
        self.savefile = filename
        
        self.chart.fromKnitML(self.savefile)
        
        self.setYarnList()
        self.setStitchList()
        self.drawChart()
        self.dirty = False
        self.chart.dirty = False
        self.setTitle()
        
        self.stopBusy()
    
    def save(self, widget):
        if self.savefile is None:
            self.saveAsDialog(None)
        else:
            self.saveFile()
            
    def saveAsDialog(self, widget):
        f = gtk.FileChooserDialog('Save as...', self.get_widget('main_window'), gtk.FILE_CHOOSER_ACTION_SAVE, \
                                (gtk.STOCK_CANCEL, gtk.RESPONSE_CANCEL, gtk.STOCK_OK, gtk.RESPONSE_OK))
        
        # add filter of .cm files
        f.add_filter(self.file_filters['cm'])
        
        response = f.run()
        if response == gtk.RESPONSE_OK:
            self.savefile = f.get_filename()
            # HACKY, need better way to save with extension
            if self.savefile.find(".cm") == -1:
                self.savefile += ".cm"
        f.destroy()
        self.setTitle()
        self.saveFile()
        
    def saveFile(self):
        self.startBusy()
        
        if self.savefile is not None:
            fp = open(self.savefile, "w")
            self.chart.toKnitML().writexml(fp, "", "\t", "\n")
            fp.close()
            self.dirty = False
            self.chart.dirty = False
            self.setTitle()
            
        self.stopBusy()
        
    def exportDialog(self, widget):
        if self.savefile is None:
            self.saveAsDialog(None)
        
        if self.savefile is not None:
            # TODO: set current vals
            widget = self.get_widget('export_dialog')
            self.startBusy()
            widget.show_all()
            response = widget.run()
            if response == gtk.RESPONSE_OK:
                exportname = self.get_widget('export_filechooser').get_filename()
                if exportname.find(".svg") == -1:
                    exportname += ".svg"
                
                numbers = ""
                if self.get_widget('column_numbers_check').get_active():
                    numbers += "b"
                    
                # 0 = None, 1 = Left, 2 = Right, 3 = LR, 4 = RL
                a = self.get_widget('row_numbers_combo').get_active()
                if a == 1:
                    numbers += "l"
                elif a == 2:
                    numbers += "r"
                elif a == 3:
                    numbers += "lr"
                elif a == 4:
                    numbers += "rl"
                    
                self.chart.toSVG(exportname, self.savefile, numbers, self.img_sqw, self.img_sqh)
                self.stopBusy()
            
            widget.hide()
                
            self.stopBusy()
        
            
    def startBusy(self):
        self.get_widget('main_window').window.set_cursor(gtk.gdk.Cursor(gtk.gdk.WATCH))
    
    def stopBusy(self):
        self.get_widget('main_window').window.set_cursor(gtk.gdk.Cursor(gtk.gdk.LEFT_PTR))
        
    def about(self, widget):
        d = gtk.AboutDialog()
        d.set_name(self.title)
        d.set_version(self.version)
        d.set_website(self.website)
        d.set_authors(self.authors)
        d.set_comments(self.description)
        
        d.connect('response', lambda w, r: w.destroy())
        d.run()
    
    # any time chart is clicked, data may have been dirtied, set title
    def chartChanged(self, chart):
        self.setTitle()
    
    def getUserConfirmation(self, msg=None, dirty_check=False):
        if dirty_check and not self.chart.dirty and not self.dirty:
            return True
        
        if msg is None:
            msg = "Are you sure?"
        d = gtk.MessageDialog(type=gtk.MESSAGE_QUESTION, buttons=gtk.BUTTONS_YES_NO, message_format=msg)
        d.show_all()
        response = d.run()
        d.destroy()
        if response == gtk.RESPONSE_YES:
            return True
        else:
            return False
        
        
if __name__ == "__main__":
    if len(sys.argv) == 2:
        cm = ChartMakerGUI(filename=sys.argv[1])
    else:
        cm = ChartMakerGUI()
