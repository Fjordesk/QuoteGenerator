document.addEventListener('DOMContentLoaded', function() {
    const hotelsTableBody = document.getElementById('hotelsTableBody');
    const addHotelBtn = document.getElementById('addHotelBtn');
    let selectedHotelComponent = null;

    // Function to calculate row total
    function calculateRowTotal(row) {
      const nights = parseFloat(row.querySelector('.nights').value) || 0;
      const units = parseFloat(row.querySelector('.units').value) || 0;
      const price = parseFloat(row.querySelector('.price').value) || 0;
      const total = nights * units * price;
      row.querySelector('.total').value = total.toFixed(2);
      updateTotalDisplay();
    }

    // Function to calculate total for a specific hotel component
    function calculateHotelTotal(hotelComponent) {
      let total = 0;
      const rows = hotelComponent.querySelectorAll('.hotel-row');
      rows.forEach(row => {
        total += parseFloat(row.querySelector('.total').value) || 0;
      });
      return total;
    }

    // Function to update total display
    function updateTotalDisplay() {
      const totalLabel = document.getElementById('totalLabel');
      const grandTotal = document.getElementById('grandTotal');
      
      // Find the selected hotel
      const selectedRadio = document.querySelector('input[name="selectedHotel"]:checked');
      if (selectedRadio) {
        const hotelComponent = selectedRadio.closest('.hotel-component');
        const hotelName = hotelComponent.querySelector('.header-input').value.trim().toUpperCase() || 'SELECTED HOTEL';
        const selectedTotal = calculateHotelTotal(hotelComponent);
        
        totalLabel.textContent = `HOTEL COST BASED ON ${hotelName}`;
        grandTotal.textContent = selectedTotal.toFixed(2);
        grandTotal.style.color = 'var(--secondary-color)';
      } else {
        totalLabel.textContent = 'HOTEL COST BASED ON';
        grandTotal.textContent = '';
        grandTotal.style.color = 'var(--secondary-color)';
      }
    }

    // Function to handle URL icon click
    function setupUrlHandling(hotelComponent) {
      const urlContainer = hotelComponent.querySelector('.url-container');
      const urlInput = urlContainer.querySelector('.hotel-url');
      const urlIcon = urlContainer.querySelector('.url-icon');
      
      urlIcon.addEventListener('click', (e) => {
        e.preventDefault();
        if (urlInput.style.display === 'none') {
          urlInput.style.display = 'block';
          urlInput.focus();
          urlIcon.style.opacity = '1';
        } else {
          urlInput.style.display = 'none';
          urlIcon.style.opacity = '0.8';
        }
      });

      urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (urlInput.value.trim()) {
            urlIcon.style.background = 'rgba(245, 130, 32, 0.3)';
            urlIcon.textContent = '🔗✓';
          }
          urlInput.style.display = 'none';
        }
      });
    }

    // Function to setup room type handling
    function setupRoomTypeHandling(hotelComponent) {
      const singleRooms = document.getElementById('singleRooms');
      const doubleRooms = document.getElementById('doubleRooms');
      const roomTypeSelects = hotelComponent.querySelectorAll('.room-type-select');
      const unitsInputs = hotelComponent.querySelectorAll('.units');

      roomTypeSelects.forEach((select, index) => {
        select.addEventListener('change', function() {
          const unitsInput = unitsInputs[index];
          if (this.value === 'single') {
            unitsInput.value = singleRooms.value || 0;
          } else if (this.value === 'double') {
            unitsInput.value = doubleRooms.value || 0;
          }
          const row = this.closest('.hotel-row');
          calculateRowTotal(row);
        });
      });
    }

    // Function to create a new room row
    function createRoomRow(hotelComponent) {
      const template = document.getElementById('hotelRowTemplate');
      const clone = template.content.cloneNode(true);
      const row = clone.querySelector('.hotel-row');
      
      // Setup the new row
      setupRoomRow(row);
      
      // Insert before the actions row
      const actionsRow = hotelComponent.querySelector('.hotel-actions');
      actionsRow.parentNode.insertBefore(row, actionsRow);
      
      // Update remove buttons state
      updateRemoveButtons(hotelComponent);
      
      return row;
    }

    // Function to setup a single room row
    function setupRoomRow(row) {
      const nightsInput = row.querySelector('.nights');
      const roomTypeSelect = row.querySelector('.room-type-select');
      
      // Set initial nights value
      const durationText = document.getElementById('durationDays').textContent;
      const nights = parseInt(durationText.match(/(\d+)\s*nights/)[1]) || 0;
      nightsInput.value = nights;
      nightsInput.classList.add('auto-populated');
      
      // Setup remove button
      const removeBtn = row.querySelector('.remove-room-btn');
      removeBtn.addEventListener('click', () => {
        const hotelComponent = row.closest('tbody');
        const hotelRows = hotelComponent.querySelectorAll('.hotel-row');
        if (hotelRows.length > 1) {
          row.remove();
          updateRemoveButtons(hotelComponent);
          updateTotalDisplay();
        }
      });
      
      // Setup input handlers
      nightsInput.addEventListener('input', () => {
        calculateRowTotal(row);
        nightsInput.classList.remove('auto-populated');
      });
      
      // Setup room type handler
      setupRoomTypeHandling(row);
      
      // Setup other inputs
      ['units', 'price'].forEach(className => {
        const input = row.querySelector('.' + className);
        if (input) {
          input.addEventListener('input', () => calculateRowTotal(row));
        }
      });
      
      // Initial calculation
      calculateRowTotal(row);
    }

    // Function to add new hotel component
    function addHotelComponent() {
      const template = document.getElementById('hotelComponentTemplate');
      const clone = template.content.cloneNode(true);
      
      // Create a new tbody for this hotel
      const hotelTbody = document.createElement('tbody');
      hotelTbody.className = 'hotel-component';
      
      // Move the cloned content into the tbody
      while (clone.firstChild) {
        hotelTbody.appendChild(clone.firstChild);
      }
      
      // Setup URL handling
      setupUrlHandling(hotelTbody);
      
      // Setup add room button
      const addRoomBtn = hotelTbody.querySelector('.add-room-btn');
      addRoomBtn.addEventListener('click', () => {
        createRoomRow(hotelTbody);
      });
      
      // Add to table
      document.getElementById('hotelsTable').appendChild(hotelTbody);
      
      // Add initial room
      createRoomRow(hotelTbody);
      
      // Setup hotel selection handler
      const radioBtn = hotelTbody.querySelector('.hotel-selector');
      radioBtn.addEventListener('change', () => {
        updateTotalDisplay();
      });
      
      // Setup hotel name change handler
      const headerInput = hotelTbody.querySelector('.header-input');
      headerInput.addEventListener('input', () => {
        if (hotelTbody.querySelector('.hotel-selector').checked) {
          updateTotalDisplay();
        }
      });
      
      // Setup delete hotel handler
      const deleteBtn = hotelTbody.querySelector('.delete-hotel-btn');
      deleteBtn.addEventListener('click', function() {
        if (hotelTbody.querySelector('.hotel-selector').checked) {
          updateTotalDisplay();
        }
        hotelTbody.remove();
      });
    }

    // Function to update remove buttons state
    function updateRemoveButtons(hotelComponent) {
      const removeButtons = hotelComponent.querySelectorAll('.remove-room-btn');
      const disableRemove = removeButtons.length <= 1;
      
      removeButtons.forEach(btn => {
        btn.disabled = disableRemove;
        btn.title = disableRemove ? 'Cannot remove last room' : 'Remove Room';
      });
    }

    // Add event listener to Add Hotel button
    addHotelBtn.addEventListener('click', addHotelComponent);

    // Add initial hotel component
    addHotelComponent();
  });