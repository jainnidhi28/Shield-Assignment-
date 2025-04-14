import requests

def get_token():
    url = 'http://127.0.0.1:8000/token'
    data = {
        'username': 'varsha24',
        'password': 'Sa@230304'
    }
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f'Status Code: {response.status_code}')
        print(f'Response: {response.text}')
        
        if response.status_code == 200:
            token = response.json().get('access_token')
            if token:
                print(f'\nYour access token is:\n{token}')
                print('\nUse this token in the Authorization header as:')
                print(f'Authorization: Bearer {token}')
    except Exception as e:
        print(f'Error: {str(e)}')

if __name__ == '__main__':
    get_token() 