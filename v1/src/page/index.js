const url = 'http://127.0.0.1:8000/notes/';

let plus = ko.observable(false)
// let note = ko.observableArray()
// let currentDate = ko.observable('')
// let new_title = ko.observable('Title')
// let new_body = ko.observable('Body')
// let edit_title = ko.observable('Title')
// let edit_body = ko.observable('Body')
let noteIdToDelete = ko.observable(9999)
m_={
  note:ko.observableArray(),
  currentDate: ko.observable(''),
  new_title:ko.observable('Title'),
  new_body:ko.observable('Body'),
  put:ko.observable(0),
  edit_title:ko.observable('Title'),
  edit_body:ko.observable('Body')
}
// m_={
//   note:[],
//   currentDate:'',
//   new_title:'Title',
//   new_body:'Body',
//   put:0,
//   edit_title:'Title',
//   edit_body:'Body'
// }

m_.get=async function get() {
  await fetch(url, {
      method: 'GET',
      headers: {
        'Origin': 'http://127.0.0.1:5500/',
        'Content-Type': 'application/json'
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      m_.note(data)
    })
    .catch(error => console.error('Ошибка при выполнении запроса:', error));
}


m_.post=async function post () {
  let now = new Date()
  this.currentDate(now.format("isoDateTime"));
  await fetch(url, {
      method: 'POST',
      headers: {
        'Origin': 'http://127.0.0.1:5500/',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "title": this.new_title(),
        "body": this.new_body(),
        "date": this.currentDate()
      }),
    })
    .then(async response => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      const data = await response.json();
      this.note.push({
        "id": data,
        "title": this.new_title(),
        "body": this.new_body(),
        "date": dateFormat(now, "yyyy-mm-dd")
      })
      return data;
    })
    .then(data => console.log(data))
    .catch(error => console.error('Ошибка при выполнении запроса:', error));

  plus(false)
  new_title('')
  new_body('')
}

m_.del = async function del(noteToDelete) {
  console.log(noteToDelete)
  let noteIdToDelete = noteToDelete.id
  await fetch(`${url}?id=${noteIdToDelete}`, {
      method: 'DELETE',
      headers: {
        'Origin': 'http://127.0.0.1:5500/',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      const indexOf = note().findIndex((n) => n.id === noteIdToDelete);
      if (indexOf >= 0) {
        note.splice(indexOf, 1)
      }
      return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Ошибка при выполнении запроса:', error));

}

// let put = ko.observable(0)



m_.edit = async function edit(noteToEdit) {
  let noteIdToEdit = noteToEdit.id
  let now = new Date()
  currentDate(now.format("isoDateTime"));
  await fetch(`${url}?id=${noteIdToEdit}`, {
      method: 'PUT',
      headers: {
        'Origin': 'http://127.0.0.1:5500/',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "title": edit_title(),
        "body": edit_body(),
        "date": currentDate()
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      const indexOf = note().findIndex((n) => n.id === noteIdToEdit);
      if (indexOf >= 0) {
        note.splice(indexOf, 1)
        console.log(note())
      }
      note.push({
        "id": noteIdToEdit,
        "title": edit_title(),
        "body": edit_body(),
        "date": dateFormat(now, "yyyy-mm-dd")
      })
      
      console.log(note())
      return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Ошибка при выполнении запроса:', error));

  m_.put(0)
}
m_.get()
// ko.track(m_)
ko.applyBindings(m_)