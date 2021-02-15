document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Send mail

  document.querySelector('#compose-form').addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Hide error message div
  document.querySelector('#error').style.display = 'none';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load appropriate mailbox
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        const mail = document.createElement('div');
        mail.className = 'email';
        mail.className += ' row';
        if (email.read === true) {
          mail.style.backgroundColor = 'gray';
        } else {
          mail.style.backgroundColor = 'white';
        }
        document.querySelector('#emails-view').append(mail);
        const sender = document.createElement('div');
        sender.className = 'col-3';
        sender.className += ' sender';
        sender.innerHTML = email.sender;
        mail.append(sender);
        const subject = document.createElement('div');
        subject.className = 'col-6';
        subject.innerHTML = email.subject;
        mail.append(subject);
        const timestamp = document.createElement('div');
        timestamp.className = 'col-3';
        timestamp.className += ' timestamp';
        timestamp.innerHTML = email.timestamp;
        mail.append(timestamp);
      })
    })
}

function send_mail(event) {

  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then(response => response.json())
    .then(result => {
      if (result.error) {
        document.querySelector('#error').innerHTML = result.error;
        document.querySelector('#error').style.display = 'block';
      } else {
        load_mailbox('sent');
      }
    })
}


