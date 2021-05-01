import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Prismic from '@prismicio/client'

import Header from '../../components/Header'
import { useRouter } from 'next/router';
import { url } from 'node:inspector';
import React from 'react';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const router = useRouter()

  const wordsNumber = post.data.content.reduce((result, data) => {
    const bodyWordsNumber = data.body.reduce((result, data) => {
      return result + data.text.split(' ').length
    }, 0)

    const headingWordsNumber = data.heading.split(' ').length

    return result + bodyWordsNumber + headingWordsNumber
  }, 0)
  const readTime = Math.ceil(wordsNumber / 200)



  if (router.isFallback) {
    return <div>Carregando...</div>
  } else {
    return (
      <div className={`${styles.container} ${commonStyles.container}`}>
        <Header />
        <img src={post.data.banner.url} className={styles.container} width='100%' height='400px' alt={post.data.title} />
        <main className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.info} >
            <div className={styles.dateContainer}>
              <FiCalendar color='#BBBBBB' />
              <span className={styles.textInfo}>{
                format(new Date(post.first_publication_date), "dd MMM yyyy", { locale: ptBR })
              }</span>
            </div>
            <div className={styles.infoItemContainer}>
              <FiUser color='#BBBBBB' />
              <span className={styles.textInfo}>
                {post.data.author}
              </span>
            </div>
            <div className={styles.infoItemContainer}>
              <FiClock color='#BBBBBB' />
              <span className={styles.textInfo}>
                {readTime} min
              </span>
            </div>
          </div>
          {
            post.data.content.map(({ heading, body }) =>
              <div className={styles.content} key={heading}>
                <h1 className={styles.heading}>{heading}</h1>
                <span className={styles.body}>{
                  body[0].text
                }</span>
              </div>
            )
          }
        </main>
      </div>
    )
  }
}


export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.content', 'posts.author'],
    pageSize: 20
  });
  
  const uids = posts.results.map(post => `/post/${post.uid}`)
  console.log({ uids })

  return {
    paths: uids ? uids : [],
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {

  const { slug } = context.params

  const prismic = getPrismicClient()
  const response = await prismic.getByUID('posts', String(slug), {}) as Post


  return {
    props: {
      post: response
    }
  }
};
