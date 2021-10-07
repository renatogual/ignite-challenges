/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useState } from 'react';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';

import styles from './home.module.scss';

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

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleNextPage() {
    const response = await fetch(nextPage);
    const responseJSON = await response.json();

    const nextPosts = responseJSON.results.map((post: Post) => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }));
    setPosts([...posts, ...nextPosts]);
    setNextPage(responseJSON.nextPage);
  }

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <main className={styles.container}>
        <div>
          {posts?.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h3>{post.data.title}</h3>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <span>
                    <FiCalendar />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        "dd ' ' MMM ' ' yyyy",
                        { locale: ptBR }
                      )}
                    </time>
                  </span>
                  <span>
                    <FiUser /> {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {nextPage && (
          <button type="button" onClick={handleNextPage}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    { pageSize: 2, orderings: '[document.last_publication_date desc]' }
  );

  const posts = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const { next_page } = postsResponse;

  const postsPagination = {
    next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
