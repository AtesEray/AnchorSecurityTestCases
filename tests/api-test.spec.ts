import { test, expect } from '@playwright/test';

// S4E API temel adresi
const API_BASE_URL = 'https://api.s4e.io/api';

// KANKA DİKKAT: Siteden bulduğun o token'ı aşağıdaki tırnakların içine yapıştır
const API_TOKEN = 'YOUR_TOKEN'; 

test.describe('S4E.io API /user/info Uç Noktası Edge Case Testleri', () => {

  test('TC-01: (Happy Path) Geçerli Token ile kullanıcı bilgileri başarılı bir şekilde çekilmeli', async ({ request }) => {
    // Dökümantasyona uygun olarak POST isteği ve JSON Body gönderiyoruz
    const response = await request.post(`${API_BASE_URL}/user/info`, {
      data: {
        token: API_TOKEN
      }
    });

    // İstek başarılı (200 OK) dönmeli
    expect(response.ok()).toBeTruthy();
    
    // Gelen JSON verisinin dökümandaki gibi 'value' objesi içerdiğini doğruluyoruz
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('value');
    expect(responseBody.value).toHaveProperty('email');
  });

  test('TC-02: (Security Edge Case) Token parametresi eksik gönderildiğinde sistem isteği reddetmeli', async ({ request }) => {
    // Body (data) kısmını bilerek boş göndererek Backend'in boş veriyi nasıl yakaladığını test ediyoruz
    const response = await request.post(`${API_BASE_URL}/user/info`, {
      data: {} 
    });

    // Sistemin 400 (Bad Request) veya 401 (Unauthorized) dönmesini bekliyoruz. Asla 200 dönmemeli.
    expect(response.ok()).toBeFalsy(); 
  });

  test('TC-03: (Security Edge Case) Geçersiz/Sahte Token ile veri sızdırma girişimi engellenmeli', async ({ request }) => {
    // Backend'i kandırmak için sahte bir token gönderiyoruz
    const response = await request.post(`${API_BASE_URL}/user/info`, {
      data: {
        token: 'sahte_ve_gecersiz_bir_token_12345'
      }
    });

    // Sistemin yetkisiz erişimi engellemesini bekliyoruz
    expect(response.ok()).toBeFalsy();
  });

  test('TC-04: (Type Validation Edge Case) Token string yerine farklı veri tipinde (int) gönderildiğinde sistem çökmameli', async ({ request }) => {
    // Token'ı dökümanda belirtilen string yerine integer (sayı) olarak göndererek API'nin tip güvenliğini (Type Safety) sınıyoruz
    const response = await request.post(`${API_BASE_URL}/user/info`, {
      data: {
        token: 123456789
      }
    });

    // Sunucunun 500 Internal Server Error (komple çökme) yerine, durumu kontrol altına alıp mantıklı bir hata (400/401) dönmesini bekliyoruz
    expect(response.status()).not.toBe(500);
    expect(response.ok()).toBeFalsy();
  });

});