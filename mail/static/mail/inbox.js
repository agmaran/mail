document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(false));

  // Send mail

  document.querySelector('#compose-form').addEventListener('submit', send_mail);



  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(reply) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  if (reply === false) {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
  // Hide error message div
  document.querySelector('#error').style.display = 'none';
}

function load_mailbox(mailbox) {
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  // Load appropriate mailbox
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        const mail = document.createElement('div');
        mail.className = 'email';
        mail.className += ' row';
        mail.addEventListener('click', function () { view_email(email.id, mailbox) });
        if (email.read === true) {
          mail.style.backgroundColor = 'gray';
        } else {
          mail.style.backgroundColor = 'white';
        }
        document.querySelector('#emails-view').append(mail);
        const sender = document.createElement('div');
        sender.className = 'col-3';
        sender.className += ' bold';
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

function view_email(email_id, mailbox) {
  if (document.querySelector('#mail')) {
    document.querySelector('#mail').remove();
  }

  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';

  //Get request to /emails/<email_id>
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      const mail = document.createElement('div');
      mail.id = 'mail';
      const from = document.createElement('div');
      const to = document.createElement('div');
      const subject = document.createElement('div');
      const time = document.createElement('div');
      const body = document.createElement('div');
      from.innerHTML = `<strong>From: </strong> ${email.sender}`;
      to.innerHTML = `<strong>To: </strong> ${email.recipients}`;
      subject.innerHTML = `<strong>Subject: </strong> ${email.subject}`;
      time.innerHTML = `<strong>Timestamp: </strong>${email.timestamp}`;
      body.innerHTML = email.body;

      mail.append(from);
      mail.append(to);
      mail.append(subject);
      mail.append(time);
      if (mailbox !== 'sent') {
        const rep = document.createElement('button');
        rep.classList = 'btn btn-sm btn-outline-primary';
        rep.innerHTML = 'Reply';
        rep.addEventListener('click', () => {
          document.querySelector('#compose-recipients').value = email.sender;
          if (email.subject.startsWith("Re:")) {
            document.querySelector('#compose-subject').value = email.subject;
          } else {
            document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
          }
          document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
          compose_email(true);
        });
        mail.append(rep);
        if (email.archived === true) {
          const unar = document.createElement('button');
          unar.classList = 'btn btn-sm btn-outline-primary';
          unar.innerHTML = 'Unarchive';
          unar.addEventListener('click', (event) => unarchive(email.id, event));
          mail.append(unar);
        } else {
          const ar = document.createElement('button');
          ar.classList = 'btn btn-sm btn-outline-primary';
          ar.innerHTML = 'Archive';
          ar.addEventListener('click', (event) => archive(email.id, event));
          mail.append(ar);
        }
      }
      mail.append(document.createElement('hr'));
      mail.append(body);
      document.querySelector('#email').append(mail);
      if (email.read === false) {
        mark_read(email_id);
      }
    })
}

function mark_read(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

}

function archive(email_id, event) {
  event.stopPropagation();
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
    .then(() => {
      load_mailbox('inbox')
    })
}

function unarchive(email_id, event) {
  event.stopPropagation();
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
    .then(() => {
      load_mailbox('inbox')
    })
}


