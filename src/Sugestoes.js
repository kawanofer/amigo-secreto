import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isEmpty, toUpper, trim, snakeCase } from 'lodash';
import { toast } from 'react-toastify'
import { useForm } from "react-hook-form";

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, collection, setDoc, getDocs } from 'firebase/firestore';

const Sugestoes = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([])
  const sectionRefs = useRef({});
  const names = useMemo(
    () => [
      'Anilson Stebel',
      'Arlete Stebel',
      'Celso Cordeiro',
      'Cristiane Kawano',
      'Daniel Burkinsky',
      'Daniela Stoebel K.',
      'Davi T. S. Kawano',
      'Eduardo Stebel',
      'Fernando Kawano',
      'Francisco Paiva',
      'Glaucio Filho',
      'Glaucio Pai',
      'Glauco Pereira',
      'Gustavo Kawano',
      'João Henrique Stebel',
      'João Stebel',
      'Jorge Kawano',
      'Karla Pereira',
      'Leonardo Pereira',
      'Luana Pereira',
      'Maria Cristina',
      'Myrian Pereira',
      'Rafael S. Pereira',
      'Sandra Burkinski',
      'Selma Camargo',
      'Sérgio Stebel',
      'Sirlei Kawano',
      'Tereza Stebel',
      'Vanessa P. Stebel'
    ], []);

  const ROOT_COLLECTION = 'sugestoes'

  // Firebase configuration (replace with your own config)
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  // Get a reference to the Firestore database
  const db = getFirestore(app);

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    // Add a scroll event listener to track when the user scrolls
    const handleScroll = () => {
      // Show the button when the user scrolls down, hide it when at the top
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    // Smoothly scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const FetchDataFromFirestore = useCallback(async () => {
    try {
      const sugestoesCollection = collection(db, ROOT_COLLECTION);
      const querySnapshot = await getDocs(sugestoesCollection);

      const fetchedData = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ name: doc.id, ...doc.data() });
      });

      setSuggestions(fetchedData);
    } catch (error) {
      console.error('Error fetching data from Firebase:', error);
    }
  }, [setSuggestions, db]);

  useEffect(() => {
    names.forEach((item) => {
      sectionRefs.current[UPPER_SNAKE_CASE(item)] = React.createRef();
    });
  }, [names]);

  useEffect(() => {
    FetchDataFromFirestore()
  }, [FetchDataFromFirestore])

  useEffect(() => {
    if (!isEmpty(suggestions)) {
      suggestions.forEach((item) => {
        setValue(UPPER_SNAKE_CASE(item.name), item.value)
      })
    }
  }, [suggestions, names, setValue])

  const onSubmit = (data) => {
    Object.entries(data).forEach(([key, value]) => {
      SaveToFirebase(key, value)
    })
    toast.success("Dados salvos com sucesso.")
    FetchDataFromFirestore()
  }

  const UPPER_SNAKE_CASE = (string) => {
    return toUpper(snakeCase(trim(string)))
  }

  const handleLinkClick = (refName) => {
    sectionRefs.current[refName].current?.scrollIntoView({ behavior: 'smooth' });
  };


  const SaveToFirebase = async (docName, value) => {
    try {
      const collectionRef = collection(db, ROOT_COLLECTION)
      const specificDocRef = doc(collectionRef, docName);
      await setDoc(specificDocRef, { value });
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
      toast.error(`Erro ao salvar dado do ${docName}.`)
    }
  }

  const CreateSideMenu = () => {
    return <div className='header'>
      <ul>
        {names?.map(name => {
          const upperSnakeCaseName = UPPER_SNAKE_CASE(name);
          return (
            <li key={name}>
              <a href={`#${upperSnakeCaseName}`} onClick={() => handleLinkClick(upperSnakeCaseName)}>
                {suggestions.map((item) => {
                  if (upperSnakeCaseName === item.name) {
                    if (item.value) {
                      return (
                        <span key={name}>
                          <FontAwesomeIcon icon={faCircleCheck} color='#45a049' /> {name}
                        </span>
                      );
                    } else {
                      return <span key={name}>{name}</span>;
                    }
                  }
                  return null;
                })}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  }

  const CreateHeader = () => {
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src="/assets/image.png" alt='imagem' style={{ marginBottom: '1rem' }} />
      <h4>Valor do presente entre R$ 100,00 e R$ 150,00</h4>
    </div>
  }

  const CreateGiftForm = () => {
    return names?.map(name => {
      const upperSnakeCaseName = UPPER_SNAKE_CASE(name);
      return <section id={upperSnakeCaseName} key={name} ref={sectionRefs.current[upperSnakeCaseName]}>
        <h2>{name}</h2>
        <form onSubmit={handleSubmit((data) => onSubmit(data))}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea placeholder='Digite aqui sua sugestão de presente' {...register(`${upperSnakeCaseName}`)} />
            <input type="submit" value='Salvar' />
          </div>
        </form>
      </section>
    })
  }

  return (
    <div className='container'>
      {CreateSideMenu()}
      <div className='main'>
        {CreateHeader()}
        {CreateGiftForm()}
      </div>
     <button
      className={`scroll-to-top-button ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
    >
      <span>↑</span>
    </button>
    </div>
  );
}

export default Sugestoes;
