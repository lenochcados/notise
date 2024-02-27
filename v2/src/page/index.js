"use strict";

const url = 'http://127.0.0.1:8000/notes/';

window.m_ = {
    all_notes: [],
    get_all: async function () {
        try {
            const data = await $.get(url);
            this.all_notes.push(...data.map(n => new Note(n)));
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error.message || error);
        }
    }
};

class Note {
    constructor(params) {
        Object.assign(this, params);

        ['title', 'body'].forEach(prop => {
          ko.getObservable(this, prop).extend({
            rateLimit: {
              timeout: 500,
              method: "notifyWhenChangesStop"
            }
          }).subscribe(body =>
            this.edit()
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
                data: JSON.stringify({ title: 'Title', body: 'Body', date: now.toISOString() })
            });

            this.all_notes.push(new Note({
                id: (this.all_notes.slice().reverse()[0]?.id || 0) + 1,
                title: 'Title',
                body: 'Body',
                date: dateFormat(now, 'yyyy-mm-dd')
            }));

            console.log(response);
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error.message || error);
        }
    }

    async del(noteIdToDelete) {
        try {
            const response = await $.ajax({ url: `${url}?id=${noteIdToDelete}`, method: 'DELETE' });
            this.all_notes.remove(note => note.id === noteIdToDelete);
            console.log(response);
        } catch (error) {
            console.trace('Ошибка при выполнении запроса:', error.message || error);
        }
    }

    async edit() {
      try {
          const now = new Date();
          const response = await $.ajax({
              url: `${url}?id=${this.id}`,
              method: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify({ title: this.title, body: this.body, date: now.toISOString() })
          });
  
          console.log(response);
      } catch (error) {
          console.trace('Ошибка при выполнении запроса:', error.message || error);
      }
  }
}

async function main() {
    ko.track(m_);
    await m_.get_all();
    ko.applyBindings(m_);
}

main();

ko.bindingHandlers.editableNote = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        const bindings = allBindingsAccessor(),
            note = bindings.editableNote,
            dataKey = bindings.dataKey;

        element.innerText = note[dataKey];

        element.addEventListener('input', function () {
            if (this.isContentEditable) {
                note[dataKey] = this.innerHTML;
            }
        });
    }
};
