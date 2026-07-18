import { useTina } from 'tinacms/dist/react'
import { client } from '../tina/__generated__/client'

export default function Home(props) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  return (
    <div style={{ padding: '2rem' }}>
      <h1>MetroTec CMS</h1>
      <p>Content management system for your static site.</p>
      <a href="/admin" style={{ 
        background: '#0070f3', 
        color: 'white', 
        padding: '10px 20px', 
        textDecoration: 'none',
        borderRadius: '5px'
      }}>
        Open CMS Admin
      </a>
    </div>
  )
}

export const getStaticProps = async () => {
  return {
    props: {
      data: {},
      query: '',
      variables: {},
    },
  }
}
