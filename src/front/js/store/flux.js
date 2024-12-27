const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			token: sessionStorage.getItem("token") || null,
			currentUser: JSON.parse(sessionStorage.getItem("currentUser")) || null,
			message: null,
			
		},
		actions: {
			// Use getActions to call a function within a fuction
			
		}
	};
};

export default getState;
