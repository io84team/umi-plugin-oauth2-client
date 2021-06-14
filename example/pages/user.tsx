import React from 'react';
import styles from './index.css';
import { useModel, Link, OAuth2UserContext } from 'umi';

const User: React.FC = () => {
    const { initialState } = useModel('@@initialState');
    console.table(initialState);

    return (
        <OAuth2UserContext.Consumer>
            {({ user, token, signOut }) => {
                const userContent = token && user && (
                    <div>
                        {user.name}
                        <br />
                        <Link to="/" onClick={signOut}>
                            SignOut
                        </Link>
                    </div>
                );
                return (
                    <div className={styles.normal}>
                        {userContent}
                        <Link to="/">Home</Link>
                    </div>
                );
            }}
        </OAuth2UserContext.Consumer>
    );
};

export default User;
