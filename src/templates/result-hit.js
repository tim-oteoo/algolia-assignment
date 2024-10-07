const resultHit = hit => `
  <div class="result-hit" data-object-id="${hit.objectID}">
    <div class="result-hit__image-container">
      <img class="result-hit__image" src="${hit.image}" alt="${hit.name}" />
    </div>
    <div class="result-hit__details">
      <h3 class="result-hit__name">${hit._highlightResult.name.value}</h3>
      <p class="result-hit__price">$${hit.price}</p>
    </div>
    <div class="result-hit__controls">
      <button class="result-hit__view" data-action="view" data-object-id="${hit.objectID}">View</button>
      <button class="result-hit__cart" data-action="cart" data-object-id="${hit.objectID}">Add To Cart</button>
    </div>
  </div>`;

export default resultHit;