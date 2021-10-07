import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

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

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  const estimatedTimeToRead = post.data.content.reduce((acc, content) => {
    const totalHeading = content.heading.split(' ').length;
    const totalBody = RichText.asText(content.body).split(' ').length;

    const total = totalBody + totalHeading + acc;
    const min = Math.ceil(total / 200);
    return min;
  }, 0);

  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>

      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>

      <section className={styles.container}>
        <div className={styles.headerPost}>
          <h1>{post.data.title}</h1>
          <div className={styles.infoPostContainer}>
            <div className={styles.infoContent}>
              <FiCalendar />
              <span>
                {format(
                  new Date(post.first_publication_date),
                  "dd ' ' MMM ' ' yyyy",
                  { locale: ptBR }
                )}
              </span>
            </div>

            <div className={styles.infoContent}>
              <FiUser />
              <span>{post.data.author}</span>
            </div>

            <div className={styles.infoContent}>
              <FiClock />
              <time>4 min</time>
              {/* <time>{`${estimatedTimeToRead} min`}</time> */}
            </div>
          </div>
        </div>

        <article className={styles.post}>
          {post.data.content.map(content => (
            <div className={styles.postSection} key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </article>
      </section>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'post')
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  // const post = {
  //   first_publication_date: response.first_publication_date,
  //   data: {
  //     title: response.data.title,
  //     banner: {
  //       url: response.data.banner.url,
  //     },
  //     author: response.data.author,
  //     content: {
  //       heading: response.data.content[0].heading,
  //       body: {
  //         text: response.data.content[0].body,
  //       },
  //     },
  //   },
  // };

  return {
    props: {
      post: response,
    },
    redirect: 60 * 30,
  };
};
