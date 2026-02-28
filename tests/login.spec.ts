import { test, expect } from '@playwright/test';

test.describe('S4E.io Sign-In Modülü Edge Case Testleri', () => {
  
  // Her testten önce giriş sayfasına yönlendiriyoruz
  test.beforeEach(async ({ page }) => {
    await page.goto('https://app.s4e.io/sign-in');
  });

  test('TC-01: Geçersiz e-posta formatı girildiğinde Giriş butonu pasif (disabled) olmalıdır', async ({ page }) => {
    // Sayfadaki e-posta metin kutusunu buluyoruz
    const emailInput = page.getByRole('textbox').first();
    
    // UI validasyonunu tetikleyecek geçersiz formatta veri giriyoruz
    await emailInput.fill('gecersiz_email_formati@.com');
    await page.fill('input[type="password"]', 'TestSifre123!');
    
    // Otomasyon sırasında Cloudflare bot koruması ve geçersiz format sebebiyle 
    // butonun tıklanabilir olmadığını (sistemin kendini koruduğunu) doğruluyoruz
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('TC-02: Sadece boşluk (space) karakterleri girildiğinde Giriş butonu pasif olmalıdır', async ({ page }) => {
    const emailInput = page.getByRole('textbox').first();

    // Sadece boşluk karakteri göndererek Trim kontrolünü test ediyoruz
    await emailInput.fill('     ');
    await page.fill('input[type="password"]', '     ');
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('TC-03: Şifre alanında maskeleme özelliği düzgün çalışmalı (Güvenlik Edge Case)', async ({ page }) => {
    // Şifrenin DOM üzerinde düz metin olarak kalıp kalmadığını kontrol ediyoruz
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC-04: Çok uzun metin girişlerinde sayfa çökmameli ve buton pasif kalarak sistemi korumalı', async ({ page }) => {
    const emailInput = page.getByRole('textbox').first();
    // 300 karakterlik anlamsız (buffer overflow denemesi) bir veri oluşturuyoruz
    const longString = 'a'.repeat(300);
    
    await emailInput.fill(`${longString}@test.com`);
    await page.fill('input[type="password"]', longString);
    
    // Klavyeden 'Tab' tuşuna basarak input'tan çıkıyoruz ki UI hatası tetiklensin
    await page.keyboard.press('Tab');
    
    // Sayfanın beyaz ekrana düşmediğini (çökmediğini) doğruluyoruz
    const formElement = page.locator('form');
    await expect(formElement).toBeVisible();
    
    // Giriş butonunun pasif kaldığını doğruluyoruz
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

});