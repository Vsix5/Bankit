function App() {
  return (
    <div>
    <header>
      <h1>Bankit</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <a href="/stores">Stores</a>
        <a href="/signin">Sign in</a>
        <a href="/cart">Cart</a>
      </nav>
      </header>
     
      <main>
 <section>
        <h2>Discover products from multiple sellers.</h2>
        <input
          type="text"
          placeholder="Search products..."
          />
          <button type="button">Search</button>
          </section>
          <section>
            <h2>Shop by category</h2>
            <div className="categories">
              <button type="button">Electronics</button>
              <button type="button">Fashion</button>
              <button type="button">Home & Living</button>
              <button type="button">Books</button>
              <button type="button">Sports</button>
            </div>
          </section>
          
      </main>
    
    </div>

  )
}

export default App;