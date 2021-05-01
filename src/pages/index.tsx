import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link'

import { FiCalendar, FiUser } from "react-icons/fi";

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';
import React, { useState } from 'react';



interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {

  const [resultsState, setResultsState] = useState<Post[]>(props.postsPagination.results)
  const [nextPageState, setNextPageState] = useState<string | null>(props.postsPagination.next_page)



  async function handleLoadMore() {
    const response = await fetch(nextPageState).then((response) => response.json())

    const newResults = response.results
    const newNextPage = response.next_page

    setNextPageState(newNextPage ? newNextPage : null)

    setResultsState([...resultsState, ...newResults])

  }

  return (
    <main className={`${styles.container} ${commonStyles.container}`}>
      <img src='/images/Logo.svg' className={styles.logo} alt="logo" />

      <ul className={styles.postContainer}>
        {
          resultsState.map(post =>
            <Link href={`post/${post.uid}`} key={post.uid}>
              <li className={styles.post} key={post.uid}>
                <h4 className={styles.title}>
                  {post.data.title}
                </h4>
                <span className={styles.subtitle}> {post.data.subtitle}</span>
                <div className={styles.info} >
                  <div className={styles.dateContainer}>
                    <FiCalendar color='#BBBBBB' />
                    <span className={styles.textInfo}>{
                      format(new Date(post.first_publication_date), "dd MMM yyyy", { locale: ptBR })
                    }</span>
                  </div>
                  <div className={styles.authorContainer}>
                    <FiUser color='#BBBBBB' />
                    <span className={styles.textInfo}>
                      {post.data.author}
                    </span>
                  </div>
                </div>
              </li>
            </Link>
          )
        }
      </ul>
      {
        nextPageState !== null &&
        <button
          className={styles.loadButton}
          onClick={handleLoadMore}
        >
          Carregar mais posts
          </button>
      }
    </main>

  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.content', 'posts.author'],
    pageSize: 20
  })


  const { results } = postsResponse
  const { next_page } = postsResponse

  return {
    props: {
      postsPagination: {
        results,
        next_page
      }
    }
  }
};

