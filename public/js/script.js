document.addEventListener('DOMContentLoaded', function () {
  const paginationButtons = document.querySelectorAll('.pagination .btn.join-item');

  paginationButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const pageNumber = this.textContent;
      console.log(`Clicked on page ${pageNumber}`);
    });
  });
});
