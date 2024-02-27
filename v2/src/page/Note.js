"use strict"

const url = 'http://127.0.0.1:8000/notes/';
let note = {}

window.m_ = {
  all_notes: [],
  get_all: function () {
    $.get(url)
      .done(data => m_.all_notes.push(...data.map(n => new Note(n))))
      .fail((_, textStatus, errorThrown) => console.error('Ошибка при выполнении запроса:', errorThrown || textStatus));
  }

}

class Note {
  constructor(params) {
    this.id = params.id
    this.date = params.date
    this.title = params.title
    this.body = params.body
    ko.track(this);

    ['title', 'body'].forEach(prop => {
      ko.getObservable(this, prop).extend({
      rateLimit: {
        timeout: 500,
        method: "notifyWhenChangesStop"
      }
    }).subscribe(title =>      
      this.edit(this.id, this.title, this.body)
    );
    })
  }

  async post_new() {
    try {
        const now = new Date();
        const response = await $.ajax({
            url,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              title: "Title", 
              body: "Body", 
              date: now.format("isoDateTime") }),
        });

        m_.all_notes.push(new Note({
            id: (m_.all_notes.slice().reverse()[0]?.id || 0) + 1,
            title: "Title",
            body: "Body",
            date: dateFormat(now, "yyyy-mm-dd")
        }));

        console.log(response);
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error.message || error);
    }
  }

  
  async del(noteIdToDelete) {
    try {
        const response = await $.ajax({
            url: `${url}?id=${noteIdToDelete}`,
            method: 'DELETE'
        });

        const indexOf = m_.all_notes.findIndex((n) => n.id === noteIdToDelete);
        if (indexOf >= 0) {
            m_.all_notes.splice(indexOf, 1);
            console.log(m_.all_notes);
        }

        console.log(response);
    } catch (error) {
        console.trace('Ошибка при выполнении запроса:', error.message || error);
    }
  }

  async edit(noteIdToEdit, newTitle, newBody) {
    try {
        const now = new Date();
        const response = await $.ajax({
            url: `${url}?id=${noteIdToEdit}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                "title": newTitle,
                "body": newBody,
                "date": now.format("isoDateTime")
            })
        });
        const indexOf = m_.all_notes.findIndex((n) => n.id === noteIdToEdit);
        if (indexOf >= 0) {
            m_.all_notes[indexOf] = {
                "id": noteIdToEdit,
                "title": newTitle,
                "body": newBody,
                "date": dateFormat(now, "yyyy-mm-dd")
            };
        }
        console.log(response);
    } catch (error) {
        console.trace('Ошибка при выполнении запроса:', error.message || error);
    }
  }
}

async function main() {
  ko.track(m_)
  await m_.get_all()
  ko.applyBindings(m_);
}

main()

ko.bindingHandlers.editableNote = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    const bindings = allBindingsAccessor(),
      note = bindings.editableNote,
      dataKey = bindings.dataKey;

    element.innerText = note[dataKey];

    $(element).on("input", function () {
      if (this.isContentEditable) {
        note[dataKey] = this.innerHTML;
      }
    })
  }
}