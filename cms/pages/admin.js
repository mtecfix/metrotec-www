import { client, listPages, listBlogPosts } from '../lib/api'

export default function Admin({ pages, posts }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', minWidth: '1024px' }}>
      <h1>MetroTec CMS Admin - Desktop Only</h1>
      
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h2>Pages ({pages.length})</h2>
          {pages.map(page => (
            <div key={page.id} style={{ 
              border: '1px solid #ddd', 
              padding: '1rem', 
              margin: '0.5rem 0',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3>{page.title}</h3>
                <p><strong>Slug:</strong> {page.slug}</p>
                <p><strong>Status:</strong> {page.published ? 'Published' : 'Draft'}</p>
              </div>
              <button style={{ 
                background: '#0070f3', 
                color: 'white', 
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Edit
              </button>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <h2>Blog Posts ({posts.length})</h2>
          {posts.map(post => (
            <div key={post.id} style={{ 
              border: '1px solid #ddd', 
              padding: '1rem', 
              margin: '0.5rem 0',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3>{post.title}</h3>
                <p><strong>Slug:</strong> {post.slug}</p>
                <p><strong>Status:</strong> {post.published ? 'Published' : 'Draft'}</p>
              </div>
              <button style={{ 
                background: '#0070f3', 
                color: 'white', 
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export async function getStaticProps() {
  try {
    const [pagesResult, postsResult] = await Promise.all([
      client.graphql({ query: listPages }),
      client.graphql({ query: listBlogPosts })
    ]);

    return {
      props: {
        pages: pagesResult.data.listPages?.items || [],
        posts: postsResult.data.listBlogPosts?.items || []
      },
      revalidate: 60
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        pages: [],
        posts: []
      }
    }
  }
}
