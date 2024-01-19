async function saveContent(postId) {
  var editor = tinymce.get('tinymce-editor');
  var content = editor.getContent();

  // Parse the HTML content using DOMParser
  var parser = new DOMParser();
  var doc = parser.parseFromString(content, 'text/html');

  // Extract the title from the first <h2> tag
  var titleElement = doc.querySelector('h2');
  var title = titleElement ? titleElement.textContent.trim() : 'Default Title';

  // Detect post has code
  var postHasCode = doc.querySelector('code') != null;

  // Remove the first <h2> tag from the content
  if (titleElement) {
    titleElement.parentNode.removeChild(titleElement);
  }

  // Serialize the modified document back to HTML
  content = new XMLSerializer().serializeToString(doc);

  try {
    const url = postId ? `/post/edit/${postId}` : '/post/add';
    const method = postId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        content: content,
	hasCode: postHasCode,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(
        `Document ${postId ? 'updated' : 'created'} successfully: `,
        data
      );
      Toastify({
        text: `Document ${postId ? 'updated' : 'created'} successfully`,
        duration: 1500,
        destination: '/',
        newWindow: true,
        close: true,
        gravity: 'top', // `top` or `bottom`
        position: 'right', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    } else {
      console.error(
        `Failed to ${postId ? 'update' : 'create'} document:`,
        data.error
      );
    }
  } catch (error) {
    console.error(`Error ${postId ? 'updating' : 'creating'} document:`, error);
  }
}

tinymce.init({
  selector: 'textarea#tinymce-editor',
  plugins:
    'print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
  imagetools_cors_hosts: ['picsum.photos'],
  menubar: 'file edit view insert format tools table help',
  toolbar:
    'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
  toolbar_sticky: true,
  autosave_ask_before_unload: true,
  autosave_interval: '30s',
  autosave_prefix: '{path}{query}-{id}-',
  autosave_restore_when_empty: false,
  autosave_retention: '2m',
  save_onsavecallback: () => saveContent(postId),
  save_oncancelcallback: () => {
    console.log('Save canceled');
  },
  image_advtab: true,
  link_list: [
    { title: 'My page 1', value: 'https://www.tiny.cloud' },
    { title: 'My page 2', value: 'http://www.moxiecode.com' },
  ],
  image_list: [
    { title: 'My page 1', value: 'https://www.tiny.cloud' },
    { title: 'My page 2', value: 'http://www.moxiecode.com' },
  ],
  image_class_list: [
    { title: 'image', value: 'image' },
    { title: 'featured', value: 'image--featured' },
  ],
  importcss_append: true,
  file_picker_callback: function (callback, value, meta) {
    /* Provide file and text for the link dialog */
    if (meta.filetype === 'file') {
      callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
    }

    /* Provide image and alt text for the image dialog */
    if (meta.filetype === 'image') {
      callback('https://www.google.com/logos/google.jpg', {
        alt: 'My alt text',
      });
    }

    /* Provide alternative source and posted for the media dialog */
    if (meta.filetype === 'media') {
      callback('movie.mp4', {
        source2: 'alt.ogg',
        poster: 'https://www.google.com/logos/google.jpg',
      });
    }
  },
  template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
  template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
  height: '40rem',
  width: '90vw',
  image_caption: true,
  quickbars_selection_toolbar:
    'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
  noneditable_noneditable_class: 'mceNonEditable',
  toolbar_mode: 'sliding',
  contextmenu: 'link image imagetools table',
  // skin: 'default',
  // content_css: 'default',
  setup: function (editor) {
    editor.on('init', function (e) {
      if (postTitle) {
        const post = `<h2>${postTitle}</h2>` + postContent;
        editor.setContent(post);
      } else {
        editor.setContent('');
      }
    });
  },
});
