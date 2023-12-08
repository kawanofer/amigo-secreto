import React, { useEffect, useState, useRef } from 'react'
import { isEmpty, toUpper, trim, snakeCase } from 'lodash';
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify'

// Import necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, collection, setDoc, getDocs } from 'firebase/firestore';

const Sugestoes = () => {
  const [suggestions, setSuggestions] = useState([])
  const sectionRefs = useRef({});
  const names = ['Anilson Stebel', 'Arlete Stebel', 'Celso', 'Cristiane Kawano', 'Daniel Burkinsky', 'Daniela Stoebel K.', 'Davi T. S. Kawano', 'Tereza Stebel', 'Eduardo Stebel', 'Fernando Kawano', 'Francisco', 'Glaucio Filho', 'Glaucio Pai', 'Glauco', 'Gustavo Kawano', 'João Henrique Stebel', 'Jorge Kawano', 'Karla Thomaz', 'Leonardo', 'Luana', 'Maria Cristina', 'Myrian', 'Rafael P. Stebel', 'Sandra', 'Selma Camargo', 'Sérgio Stebel', 'João Stebel', 'Sirlei Kawano', 'Vanessa P. Stebel']
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
    names.forEach((item) => {
      sectionRefs.current[UPPER_SNAKE_CASE(item)] = React.createRef();
    });
  }, [names]);

  useEffect(() => {
    FetchDataFromFirestore()
  }, [])

  useEffect(() => {
    if (!isEmpty(suggestions)) {
      console.log('Sugestões: ', suggestions)
      suggestions.forEach((item, index) => {
        setValue(`${UPPER_SNAKE_CASE(item.name)}-${index}`, item.value)
      })
    }
  }, [suggestions, names])

  const onSubmit = (data) => {
    Object.entries(data).forEach(([key, value]) => {
      SaveToFirebase(key, value)
    })
    toast.success("Dados salvos com sucesso.")
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
    console.log('Salvando: ', docName, value)
    try {
      const collectionRef = collection(db, ROOT_COLLECTION)
      const sanitizedDocName = docName.replace(/[\\/]/g, "_");
      const specificDocRef = doc(collectionRef, sanitizedDocName);
      await setDoc(specificDocRef, { value });
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
      toast.error(`Erro ao salvar dado do ${docName}.`)
    }
  }

  return (
    <>
      <header>
        <nav>
          <ul>
            {names?.map((name) => (
              <li key={name}>
                <a href={`#${UPPER_SNAKE_CASE(name)}`} onClick={() => handleLinkClick(UPPER_SNAKE_CASE(name))}>
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main>
        <img src="/public/assets/image.png" alt='imagem' />
        {names?.map((name, index) => {
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
      </main>
    </>
  );
}

export default Sugestoes;
