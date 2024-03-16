import random

TEAMCOUNT = 100

def gen_password():
    return ''.join(random.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(12))

passwords = [gen_password() for _ in range(TEAMCOUNT)]

with open('accounts.txt', 'w') as f:
    for password in passwords:
        f.write(password + '\n')
