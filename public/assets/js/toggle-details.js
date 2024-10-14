<script>
document.addEventListener('DOMContentLoaded', function() {
  // Get the Telugu Food icon box and the registration details div
  const teluguFoodBox = document.getElementById('telugu-food');
  const teluguFoodDetails = document.getElementById('telugu-food-details');
  
  // Add click event listener to the Telugu Food box
  teluguFoodBox.addEventListener('click', function() {
    // Toggle the visibility of the registration details
    if (teluguFoodDetails.style.display === 'none' || teluguFoodDetails.style.display === '') {
      teluguFoodDetails.style.display = 'block';
    } else {
      teluguFoodDetails.style.display = 'none';
    }
  });
});
</script>
