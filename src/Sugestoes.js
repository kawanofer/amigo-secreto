import React, { useEffect, useState, useRef } from 'react'
import { isEmpty, toUpper, trim, snakeCase } from 'lodash';
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify'

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, collection, setDoc, getDocs } from 'firebase/firestore';

const Sugestoes = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([])
  const sectionRefs = useRef({});
  const names = [
    'Anilson Stebel', 
    'Arlete Stebel', 
    'Celso Pereira', 
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
    'Karla Burkinski', 
    'Leonardo Pereira', 
    'Luana Pereira', 
    'Maria Cristina', 
    'Myrian Pereira', 
    'Rafael P. Stebel', 
    'Sandra Burkinski', 
    'Selma Camargo', 
    'Sérgio Stebel', 
    'Sirlei Kawano', 
    'Tereza Stebel', 
    'Vanessa P. Stebel'
  ]
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

  useEffect(() => {
    names.forEach((item) => {
      sectionRefs.current[UPPER_SNAKE_CASE(item)] = React.createRef();
    });
  }, [names]);

  useEffect(() => {
    FetchDataFromFirestore()
  }, [])

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

  const FetchDataFromFirestore = async () => {
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

  return (
    <div className='container'>
      <div className='header'>
        <ul>
          {names?.map((name) => (
            <li key={name}>
              <a href={`#${UPPER_SNAKE_CASE(name)}`} onClick={() => handleLinkClick(UPPER_SNAKE_CASE(name))}>
                {name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className='main'>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/assets/image.png" alt='imagem' />
        </div>
        {names?.map(name => {
          return <section id={UPPER_SNAKE_CASE(name)} key={name} ref={sectionRefs.current[UPPER_SNAKE_CASE(name)]}>
            <h2>{name}</h2>
            <form onSubmit={handleSubmit((data) => onSubmit(data))}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <textarea placeholder={`${name} digite aqui sua sugestão de presente.`} {...register(`${UPPER_SNAKE_CASE(name)}`)} />
                <input type="submit" value='Salvar' />
              </div>
            </form>
          </section>
        })}
      </div>

      <div className={`scroll-to-top-button ${isVisible ? 'visible' : ''}`} onClick={scrollToTop}>
        <span>↑</span>
      </div>
    </div>
  );
}

export default Sugestoes;
