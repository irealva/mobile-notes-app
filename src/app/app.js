/** 
 * app.js
 * Main application code for a mobile notes-taking application built using jQuery Mobile
 * Users can create, edit, or save notes
 * @author Irene Alvarado
 */


/**
 * jQuery form serialization: convert form elements as a JS object for manipulation
 * http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
 */
$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

/**
 * Main application object
 */
var app = {
    /**
     * Gets all notes from localStorage
     */
    getFromStorage: function() {
        try {
            var notes = null;
            notes = JSON.parse(window.localStorage.getItem("notes"));
        } catch (error) {
            alert(error.message);
        } finally {
            return notes;
        }
    },

    /**
     * Get a specific note from localStorage by id
     * @param {number} id the note id
     */
    getFromStorageId: function(id) {
        var notes = app.getFromStorage();
        var len = notes.length;
        var note = null;

        for (var i = 0; i < len; i++) { //Find the note by id
            if (notes[i].id === id) {
                note = notes[i];
                break; // Once note is found break from loop
            }
        }
        return note;
    },

    /**
     * Saves all notes into localStorage
     * @param {object} notes object representing all notes
     * @param {string} customError error message to display if function fails
     */
    saveToStorage: function(notes, customError) {
        try {
            window.localStorage.setItem("notes", JSON.stringify(notes));
        } catch (error) {
            alert(customError + ": " + error.message);
        }
    },

    /**
     * Load sample notes if first time visiting app
     */
    loadSampleNotes: function() {
        var notes = app.getFromStorage();

        if (notes === null) { // if no "notes" object in local storage then first time visiting app
            var sampleNotes = [{
                "id": 1,
                "title": "Add a new note:",
                "description": "Click on the upper right 'New' icon to add a note"
            }, {
                "id": 2,
                "title": "Delete this note:",
                "description": "Click on the delete 'x' icon on the right"
            }, {
                "id": 3,
                "title": "Edit this note:",
                "description": "Click here to edit this note"
            }];

            app.saveToStorage(sampleNotes, "Problem loading sample notes");
        }
    },

    /**
     * Find and render all notes
     */
    findAll: function() {
        var notes = app.getFromStorage();
        var len = notes.length;
        var note;

        allNotes = [];

        for (var i = 0; i < len; i++) { //Loop through all notes and push to allNotes array
            note = notes[i];
            allNotes.push('<li data-row-id="' + note.id + '"><a href="view.html" data-transition="slide" class="view" data-view-id="' + note.id + '"><h2>' + note.title + '</h2><p>' + note.description + '</p></a><a href="#" data-icon="delete" data-iconpos="notext" class="delete-button" data-mark-id="' + note.id + '">Delete</a></li>');
        }

        $('.notes-listview li').remove(); //Remove any notes currently in the notes-listview
        $('.notes-listview').append(allNotes); //Append all the notes in our allNotes array
        $('.notes-listview').listview('refresh'); //Refresh the jQuery Mobile listview
    },

    /**
     * Find a note with a specific ID and pass the information along to the "view.html" page
     * @param {number} id the note id
     */
    findId: function(id) {
        var note = app.getFromStorageId(id);

        // triggered on the "toPage" we are transitioning to, before the actual transition animation is kicked off.
        $(document).on('pagebeforeshow', '#view', function(event) {
            $('#title').val(note.title);
            $('#title').attr('data-id', id);
            $('#description').val(note.description);
            $('#id').val(id);
        });
    },

    /**
     * Insert a new note
     * @param {string} json string representing the new note to add
     */
    insert: function(json) {
        var passedJson = JSON.parse(json); // Convert a json string into an object

        var notes = app.getFromStorage();
        var len = notes.length;
        var note = null;

        if (len === 0) { // If no notes stored, then create a new one with id=1
            var newNote = {
                "id": 1,
                "title": passedJson.title,
                "description": passedJson.description
            };
            notes.push(newNote);
        } else { // If notes already stored, then create new one with id=lastNoteStored + 1
            var lastNote = notes.pop();

            var newNote = {
                "id": lastNote.id + 1,
                "title": passedJson.title,
                "description": passedJson.description
            };

            notes.push(lastNote); // Add the last note popped
            notes.push(newNote); // Add the new note
        }

        app.saveToStorage(notes, "Problem saving new note to storage");

        $.mobile.changePage($("#home"), { //Redirect back to index.html page
            transition: "slide",
            reverse: true,
            changeHash: true,
        });
    },

    /**
     * Update a note that has been edited in "view.html"
     * @param {string} json string representing the note to update
     */
    update: function(json) {
        var passedJson = JSON.parse(json); // Convert a json string into an object

        var notes = app.getFromStorage();

        $.each(notes, function(i, val) { // Loop through notes and update the edited note
            if (val.id == passedJson.id) {
                val.title = passedJson.title;
                val.description = passedJson.description;
                return false;
            }
        });

        app.saveToStorage(notes, "Problem updating the note");
    },

    /**
     * Deletes a note. Triggered from the "view.html" page
     * @param {string} json string representing the note to delete
     */
    delete: function(json) {
        var passedJson = JSON.parse(json); // Convert a json string into an object

        var notes = app.getFromStorage();
        var len = notes.length;

        for (var i = 0; i < len; i++) { // Loop through notes and remove the one user selected
            if (notes[i].id == passedJson.id) {
                notes.splice(i, 1); //removes 1 element at position i 
                break; // break from loop once note is found
            }
        }

        app.saveToStorage(notes, "Problem deleting note in your localstorage");

        $.mobile.changePage($("#home"), { //Redirect back to index.html page
            transition: "slide",
            reverse: true,
            changeHash: true
        });
    },

    /**
     * Deletes a note. Triggered from the "index.html" page if user clicks on delete icon next to a note
     * @param {number} id string representing the note id
     */
    deleteButton: function(id) {
        var notes = app.getFromStorage();
        var len = notes.length;

        for (var i = 0; i < len; i++) { // Loop through notes and remove the one user selected
            if (notes[i].id == id) {
                notes.splice(i, 1); // Removes 1 element at position i 
                break;
            }
        }

        app.saveToStorage(notes, "Problem deleting note in your localstorage");

        var noteDelete = $('#home *[data-row-id="' + id + '"]');
        noteDelete.remove();
    },

    /**
     * Binds events when app initializes
     */
    initialize: function() {
        $(document).on('pagebeforeshow', '#home', function(event) {
            app.loadSampleNotes();
            app.findAll();
        });

        $(document).on('click', '.view', function(event) {
            app.findId($(this).data('view-id'));
        });

        $(document).on('click', '.new', function(event) {
            var data = JSON.stringify($('#insert').serializeObject());
            app.insert(data);
        });

        $(document).on('change', '.target', function(event) {
            var data = JSON.stringify($('#edit').serializeObject());
            app.update(data);
        });

        $(document).on('click', '.delete', function(event) {
            var data = JSON.stringify($('#edit').serializeObject());
            app.delete(data);
        });

        $(document).on('click', '.delete-button', function(event) {
            app.deleteButton($(this).data('mark-id'));
        });
    }

};

app.initialize();
