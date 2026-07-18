import '../aws-config'
import { TinaCMS } from 'tinacms'

export default function App({ Component, pageProps }) {
  return (
    <TinaCMS>
      <Component {...pageProps} />
    </TinaCMS>
  )
}
