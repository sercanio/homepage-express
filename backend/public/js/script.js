function confirmChangeVisibility(postId) {
  var result = confirm("Are you sure you want to change visibility of this post?");
  if (result) {
    window.location.href = `/post/toggle-visibility/${postId}`
  }
}

function confirmDelete(postId) {
  var result = confirm("Are you sure you want to delete this post?");
  if (result) {
    window.location.href = `/post/delete/${postId}`;
  }
}