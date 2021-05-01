import styles from './header.module.scss'
import { useRouter } from 'next/router'

export default function Header() {
  const router = useRouter()

  function handleClick() {
    router.push('/', '/', {})
  }

  return (
    <img src='/images/Logo.svg' className={styles.logo} alt="logo" onClick={handleClick} />
  )
}
